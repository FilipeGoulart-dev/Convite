# Um convite especial ♡

Um convite responsivo, feito com HTML, CSS e JavaScript, que funciona no GitHub Pages sem servidor. O botão “Não” foge de brincadeira. Ao clicar em “Sim”, a resposta é enviada automaticamente por e-mail usando o [Formspree](https://formspree.io/). A pessoa convidada não precisa abrir outro aplicativo nem fazer outra confirmação.

## 1. Configure o recebimento por e-mail

O GitHub Pages só hospeda arquivos estáticos: ele **não envia e-mails sozinho**. O Formspree oferece um plano gratuito sujeito aos limites e condições atuais do serviço.

1. Crie uma conta gratuita no [Formspree](https://formspree.io/) e confirme seu endereço de e-mail, se solicitado.
2. Crie um formulário no painel e configure o e-mail que receberá as respostas. Copie o **Form Endpoint**, que tem o formato `https://formspree.io/f/SEU_ID`.
3. Abra `config.js` e coloque o endereço entre as aspas de `formspreeEndpoint`. Preencha também `remetente` e `destinataria` se quiser identificar o convite no e-mail:

   ```js
   window.CONVITE_CONFIG = {
     formspreeEndpoint: "https://formspree.io/f/SEU_ID",
     remetente: "Seu nome",
     destinataria: "Nome dela"
   };
   ```

   Troque `SEU_ID` pelo identificador real fornecido pelo Formspree. O endereço é público no código do site: **não coloque senha, token ou chave secreta** nele. Qualquer pessoa com o link pode enviar respostas, então o serviço pode receber spam e o limite do plano pode ser consumido.
4. Publique o projeto e faça um teste real: abra o site, clique em “Sim” e verifique a mensagem de sucesso e seu e-mail (inclusive a pasta de spam). Confirme no painel do Formspree se a resposta chegou. Se necessário, finalize as verificações solicitadas pelo serviço. Não envie o convite antes de testar.

A resposta só será registrada se a conexão e o serviço funcionarem. Em caso de erro, a página avisa e oferece uma nova tentativa. Sem um endpoint configurado, a página informa que o aviso não foi configurado; não há envio automático. Os nomes e a URL da página são enviados ao Formspree junto com a resposta; não inclua dados sensíveis na configuração ou na URL.

## 2. Publique no GitHub Pages

1. Envie os arquivos deste projeto para o seu repositório no GitHub, incluindo `assets/` e o `config.js` configurado.
2. No repositório, abra **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, selecione o branch que deseja publicar e a pasta **/ (root)**. Clique em **Save**.
3. Aguarde a publicação e abra o endereço informado em Settings → Pages. Compartilhe esse link depois de testar o recebimento do e-mail.

Você também pode testar a aparência localmente abrindo `index.html`, ou iniciar um servidor simples com `python3 -m http.server 8000` e acessar o endereço exibido. Para validar o envio, teste principalmente pela URL publicada.

## Personalização

Edite os textos em `index.html` e as frases divertidas na lista `phrases`, em `script.js`. As cores e o layout estão em `style.css`. A imagem está em `assets/convite-illustration.png`.

### Por que e-mail em vez de WhatsApp?

Um link de WhatsApp geralmente exige que a pessoa abra o aplicativo e envie a mensagem manualmente. Envio automático por WhatsApp normalmente exige um serviço de mensagens, configuração adicional e pode ter custos. Para este projeto estático, o Formspree por e-mail é a opção mais simples para começar.

## Carta de abertura e música

Ao entrar, a pessoa vê um envelope fechado. Ao clicar (ou pressionar Enter/Espaço), a carta abre e revela o convite. A animação respeita a preferência de movimento reduzido do dispositivo. Sem JavaScript, o convite continua visível.

O áudio incluído é `musica de fundo.mp3`, na raiz do projeto. A opção `musica` em `config.js` aponta para `musica%20de%20fundo.mp3` (os espaços são codificados para uso na URL). Para trocar a música, adicione outro arquivo de áudio válido e ajuste esse caminho. Inclua o MP3 ao publicar o site.

O som inicia no clique de abertura, em volume de 35%, e toca em repetição. Há um botão para pausar/retomar. Se o arquivo não estiver disponível ou o navegador bloquear a reprodução, o convite abre normalmente e o botão permite tentar novamente.
