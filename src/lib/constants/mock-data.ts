import { AACRC_EVENT } from "@/lib/events/aacrc-05072026";
import type { FAQItem, HowItWorksStep, Testimonial } from "@/types";

export const LATEST_EVENTS = [
  AACRC_EVENT,
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Encontre sua foto",
    description:
      "Digite o número da sua foto ou navegue pelos eventos disponíveis.",
  },
  {
    step: 2,
    title: "Adicione ao carrinho",
    description:
      "Escolha suas fotos e adicione ao carrinho.",
  },
  {
    step: 3,
    title: "Baixe em alta resolução",
    description:
      "Após o pagamento, faça o download imediatamente.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Rafael Mendes",
    role: "Entusiasta automotivo",
    content:
      "As fotos ficaram incríveis. Qualidade profissional e entrega rápida.",
    rating: 5,
  },
  {
    id: "2",
    name: "Camila Souza",
    role: "Organizadora de eventos",
    content:
      "Excelente cobertura. Recomendo demais.",
    rating: 5,
  },
  {
    id: "3",
    name: "Lucas Ferreira",
    role: "Piloto",
    content:
      "As fotos ficaram perfeitas.",
    rating: 5,
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "Como encontro minhas fotos?",
    answer:
      "Abra a página Eventos, escolha o evento em que você participou e navegue pela galeria. Se recebeu um número do fotógrafo, use a busca pelo número para chegar mais rápido. Dentro do evento também é possível ordenar as imagens e, quando houver mais de um profissional, filtrar pelo fotógrafo.",
  },
  {
    id: "2",
    question: "Não sei o número da minha foto. Ainda consigo encontrá-la?",
    answer:
      "Sim. O número serve apenas como atalho. Entre na galeria do evento e procure visualmente pelas miniaturas. Você pode abrir qualquer foto para conferir os detalhes, favoritar as melhores e continuar procurando sem perder sua seleção.",
  },
  {
    id: "3",
    question: "Como faço para comprar uma ou várias fotos?",
    answer:
      "Abra a foto desejada e adicione ao carrinho. Para comprar várias, use a seleção múltipla da galeria e marque todas as imagens antes de continuar. No carrinho você confere os itens, descontos disponíveis e o valor final; depois é só preencher os dados e escolher o pagamento.",
  },
  {
    id: "4",
    question: "Quais formas de pagamento são aceitas?",
    answer:
      "Você pode pagar por PIX ou pelo checkout seguro do Mercado Pago. No Mercado Pago aparecem cartão, saldo da conta e as demais opções disponíveis para o seu perfil. A liberação das fotos acontece somente depois que o pagamento é confirmado.",
  },
  {
    id: "5",
    question: "Quando e onde recebo as fotos compradas?",
    answer:
      "Assim que o pagamento for aprovado, o pedido e os downloads ficam disponíveis em Minha Conta. Você também poderá abrir a página de entrega vinculada ao pedido e baixar cada foto ou todas de uma vez. Se o pagamento ainda estiver processando, aguarde a confirmação do Mercado Pago e atualize o pedido.",
  },
  {
    id: "6",
    question: "A foto comprada vem sem marca-d'água e em alta qualidade?",
    answer:
      "Sim. As imagens exibidas na galeria são versões protegidas para visualização. Após a confirmação da compra, você recebe o arquivo original em alta resolução, sem a marca-d'água usada nas prévias do site.",
  },
  {
    id: "7",
    question: "Existe desconto para comprar várias fotos?",
    answer:
      "Quando o evento possuir pacotes ou descontos por quantidade, o carrinho calcula a melhor condição automaticamente conforme o número de fotos selecionadas. Cupons válidos também podem ser aplicados no checkout, respeitando as regras de cada evento ou promoção.",
  },
  {
    id: "8",
    question: "Como sei qual fotógrafo fez minha foto?",
    answer:
      "Nos eventos com mais de um fotógrafo, a galeria permite identificar e filtrar o profissional responsável. Você também pode abrir o perfil dele para conhecer seus cargos, biografia, avaliações, eventos fotografados, WhatsApp e portfólio individual.",
  },
  {
    id: "9",
    question: "Vocês fazem ensaios, casamentos e outros eventos particulares?",
    answer:
      "Sim. Além das coberturas automotivas, a M&M atende ensaios individuais, casamentos, aniversários, gestantes, eventos corporativos e outros projetos. Acesse Serviços, escolha a categoria e o pacote de interesse e envie uma solicitação de orçamento com data, local e detalhes do trabalho.",
  },
  {
    id: "10",
    question: "Minha galeria é privada ou não aparece em Eventos. Como acesso?",
    answer:
      "Galerias privadas e não listadas não aparecem na vitrine pública. Use o link ou código de acesso enviado pela equipe. Esse controle protege trabalhos particulares e permite que somente as pessoas autorizadas visualizem ou selecionem as imagens.",
  },
  {
    id: "11",
    question: "O que faço se o pagamento, download ou acesso apresentar erro?",
    answer:
      "Abra a Central de Ajuda e explique o ocorrido para o pré-atendimento inteligente. Informe seu nome, contato e, se houver, o número do pedido — nunca envie senha, dados completos do cartão ou código PIX. Você pode encaminhar o resumo ao WhatsApp ou conversar pelo chat mantendo o histórico na sua conta.",
  },
  {
    id: "12",
    question: "Posso pedir a remoção de uma foto ou dos meus dados?",
    answer:
      "Sim. Pela área de Privacidade você pode solicitar acesso, correção ou exclusão dos seus dados e também informar uma imagem que precise ser analisada. A equipe registra e acompanha a solicitação conforme a Política de Privacidade e a LGPD.",
  },
];
