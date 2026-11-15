# Mortua Flora - site

Site estático (HTML + CSS + JS). Não precisa instalar nada.

## Publicar no GitHub Pages
1. Crie uma conta em github.com e clique em **New repository**. Nome sugerido: `mortuaflora` (público).
2. Na página do repositório, clique em **uploading an existing file** e arraste **o conteúdo** desta pasta
   (index.html, css, js, assets, guias). O `index.html` precisa ficar na raiz do repositório.
3. Clique em **Commit changes**.
4. Vá em **Settings > Pages**. Em *Build and deployment*, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e clique em **Save**.
5. Em 1 a 2 minutos o site abre em `https://SEU-USUARIO.github.io/mortuaflora/`.

## Onde editar
- `js/config.js`: WhatsApp, telefone, Instagram, e-mail, endereço e mensagem do "Fale conosco".
- `js/plants.js`: lista de plantas (nome, nome científico, foto).
- `js/main.js`: comportamento do botão "Consultar disponibilidade".
- `css/style.css`: cores e tamanhos (variáveis no topo).
- `guias/`: os PDFs. Se trocar um PDF, mantenha o mesmo nome do arquivo.

## Disponibilidade (banco de dados)
Hoje, ao passar o mouse numa planta, aparece "Consultar disponibilidade" e o botão abre o WhatsApp
com a mensagem pronta. Quando o banco existir, coloque o endereço da API em `apiDisponibilidade`
(`js/config.js`). Ela deve devolver algo como `{ "cobra-lily": true, "black-bat": false }`
e o site passa a mostrar "Disponível/Indisponível" em cada planta.
