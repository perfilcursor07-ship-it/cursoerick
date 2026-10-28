import { db } from './db';

/**
 * Regra de liberacao de uma aula.
 *
 * Uma aula esta LIBERADA quando:
 *  - release_mode = 'free'                                  -> aula de apresentacao, aberta a todos
 *  - release_mode = 'manual'    e is_released = true         -> o admin clicou em "liberar"
 *  - release_mode = 'scheduled' e release_at <= agora        -> liberacao automatica por data
 *  - ou existe liberacao individual para aquele aluno (lesson_access)
 *
 * Alem disso, se o curso for sequencial, a aula so abre depois que a anterior
 * for concluida. Administradores enxergam tudo liberado.
 */
export function isGloballyReleased(lesson, now = new Date()) {
  if (lesson.release_mode === 'free') return true;
  if (lesson.release_mode === 'manual') return Boolean(lesson.is_released);
  if (lesson.release_mode === 'scheduled') {
    return Boolean(lesson.release_at) && new Date(lesson.release_at) <= now;
  }
  return false;
}

export function lockReason(lesson, { released, previousDone, sequential }) {
  if (released && (!sequential || previousDone)) return null;
  if (!released) {
    if (lesson.release_mode === 'scheduled' && lesson.release_at) {
      return { code: 'scheduled', message: 'Liberacao programada' };
    }
    return { code: 'locked', message: 'Aguardando liberacao' };
  }
  return { code: 'sequence', message: 'Conclua a aula anterior' };
}

/**
 * Monta a arvore do curso (modulos + aulas) ja com o estado de cada aula
 * calculado para o usuario informado.
 */
export async function getCourseTree(courseSlug, user) {
  const course = await db('courses').where({ slug: courseSlug }).first();
  if (!course) return null;

  const isAdmin = user?.role === 'admin';
  if (!course.is_published && !isAdmin) return null;

  const modules = await db('modules')
    .where({ course_id: course.id })
    .orderBy([{ column: 'position' }, { column: 'id' }]);

  const moduleIds = modules.map((m) => m.id);
  const lessons = moduleIds.length
    ? await db('lessons')
        .whereIn('module_id', moduleIds)
        .where((qb) => {
          if (!isAdmin) qb.where('is_published', true);
        })
        .orderBy([{ column: 'module_id' }, { column: 'position' }, { column: 'id' }])
    : [];

  const lessonIds = lessons.map((l) => l.id);

  const [grants, progress] = user
    ? await Promise.all([
        lessonIds.length
          ? db('lesson_access').where({ user_id: user.id }).whereIn('lesson_id', lessonIds)
          : [],
        lessonIds.length
          ? db('lesson_progress').where({ user_id: user.id }).whereIn('lesson_id', lessonIds)
          : [],
      ])
    : [[], []];

  const grantSet = new Set(grants.map((g) => g.lesson_id));
  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]));

  const now = new Date();
  let previousDone = true; // a primeira aula nunca depende de nada
  let totalUnlocked = 0;
  let totalCompleted = 0;

  // ordem global das aulas (para a regra sequencial)
  const ordered = modules.flatMap((mod) => lessons.filter((l) => l.module_id === mod.id));
  const stateById = new Map();

  for (const lesson of ordered) {
    const prog = progressMap.get(lesson.id);
    const completed = Boolean(prog?.completed);
    const released = isGloballyReleased(lesson, now) || grantSet.has(lesson.id);
    const unlocked = isAdmin || (released && (!course.sequential || previousDone));
    const reason = isAdmin ? null : lockReason(lesson, { released, previousDone, sequential: course.sequential });

    stateById.set(lesson.id, {
      unlocked,
      completed,
      secondsWatched: prog?.seconds_watched || 0,
      lock: unlocked ? null : reason,
      grantedIndividually: grantSet.has(lesson.id),
    });

    if (unlocked) totalUnlocked += 1;
    if (completed) totalCompleted += 1;
    previousDone = completed;
  }

  const tree = modules.map((mod) => ({
    ...mod,
    lessons: lessons
      .filter((l) => l.module_id === mod.id)
      .map((l) => ({ ...l, state: stateById.get(l.id) })),
  }));

  const totalLessons = ordered.length;

  return {
    course,
    modules: tree,
    stats: {
      totalLessons,
      totalUnlocked,
      totalCompleted,
      percent: totalLessons ? Math.round((totalCompleted / totalLessons) * 100) : 0,
      nextLesson:
        ordered.find((l) => stateById.get(l.id)?.unlocked && !stateById.get(l.id)?.completed) ||
        null,
    },
  };
}

/** Verifica o acesso a UMA aula especifica (usado no player e no streaming). */
export async function getLessonForUser(slug, user) {
  const lesson = await db('lessons').where({ slug }).first();
  if (!lesson) return { lesson: null, unlocked: false };

  const mod = await db('modules').where({ id: lesson.module_id }).first();
  const course = mod ? await db('courses').where({ id: mod.course_id }).first() : null;
  if (!course) return { lesson: null, unlocked: false };

  if (user?.role === 'admin') {
    return { lesson, module: mod, course, unlocked: true, completed: false };
  }

  if (!lesson.is_published || !course.is_published) {
    return { lesson, module: mod, course, unlocked: false };
  }

  const grant = user
    ? await db('lesson_access').where({ user_id: user.id, lesson_id: lesson.id }).first()
    : null;

  const released = isGloballyReleased(lesson) || Boolean(grant);

  let previousDone = true;
  if (course.sequential) {
    const siblings = await db('lessons')
      .join('modules', 'modules.id', 'lessons.module_id')
      .where('modules.course_id', course.id)
      .where('lessons.is_published', true)
      .orderBy([
        { column: 'modules.position' },
        { column: 'lessons.position' },
        { column: 'lessons.id' },
      ])
      .select('lessons.id');

    const index = siblings.findIndex((s) => s.id === lesson.id);
    if (index > 0 && user) {
      const prev = await db('lesson_progress')
        .where({ user_id: user.id, lesson_id: siblings[index - 1].id })
        .first();
      previousDone = Boolean(prev?.completed);
    }
  }

  const progress = user
    ? await db('lesson_progress').where({ user_id: user.id, lesson_id: lesson.id }).first()
    : null;

  const unlocked = released && (!course.sequential || previousDone);

  return {
    lesson,
    module: mod,
    course,
    unlocked,
    completed: Boolean(progress?.completed),
    secondsWatched: progress?.seconds_watched || 0,
    lock: unlocked ? null : lockReason(lesson, { released, previousDone, sequential: course.sequential }),
  };
}
