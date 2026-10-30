
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
git pull origin main
git checkout -- deploy.sh && git pull origin main && chmod +x deploy.sh && ./deploy.sh



SUBIR GIT
git add .
git commit -m "feat: sua mensagem aqui"
git push origin main
