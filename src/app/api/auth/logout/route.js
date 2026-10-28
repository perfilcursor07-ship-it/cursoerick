import { destroySession } from '@/lib/auth';
import { jsonOk } from '@/lib/utils';

export async function POST() {
  destroySession();
  return jsonOk({ redirect: '/' });
}
