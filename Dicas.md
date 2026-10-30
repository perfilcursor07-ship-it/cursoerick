
-- Local
git pull
npm install
npm run migrate
npm run seed
npm run build:css
npm run dev

PRODUÇÃO
git pull --ff-only origin main

CAMINHO
cd /home/nomadesface/htdocs/nomadesface.online/cursoerick
NODE_ENV=production npm run migrate
npm run build
pm2 restart cursoerick --update-env



SUBIR GIT
git add .
git commit -m "feat: sua mensagem aqui"
git push origin main
