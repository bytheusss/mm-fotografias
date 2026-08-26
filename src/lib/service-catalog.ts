export type ServicePackage={slug:string;name:string;tagline:string;price:number|null;hours?:number;photos?:number;featured?:boolean;includes:string[]};
export type ServiceCategory={slug:string;name:string;short:string;description:string;image:string;packages:ServicePackage[]};
const pack=(slug:string,name:string,tagline:string,price:number,hours:number,photos:number,includes:string[],featured=false):ServicePackage=>({slug,name,tagline,price,hours,photos,includes,featured});

export const SERVICE_CATALOG:ServiceCategory[]=[
 {slug:"casamento",name:"Casamentos",short:"Histórias completas, do sim à celebração.",description:"Coberturas exclusivamente fotográficas, com direção cuidadosa, registros espontâneos e galeria online.",image:"/images/services/casamento.webp",packages:[
  pack("essencial","Essencial","O momento principal com toda a emoção.",1200,4,150,["Cerimônia completa","Família, padrinhos e miniensaio","150 fotos editadas","Galeria privada por 90 dias"]),
  pack("elegance","Elegance","Equilíbrio perfeito entre cobertura e investimento.",2400,8,300,["Making of da noiva","Cerimônia e início da recepção","Convidados e registros espontâneos","300 fotos editadas","Galeria organizada por 180 dias"],true),
  pack("lux","Lux","A experiência completa e premium.",3800,12,500,["Making of da noiva e do noivo","Cerimônia e festa completas","Direção editorial e detalhes","500 fotos editadas","Galeria para convidados por 365 dias"])
 ]},
 {slug:"individual",name:"Ensaio individual",short:"Retratos com personalidade e direção.",description:"Para marcar fases, fortalecer sua imagem ou simplesmente celebrar quem você é.",image:"/images/services/individual.webp",packages:[
  pack("essencial","Essencial","Objetivo, leve e autêntico.",350,.75,15,["Uma localização e um look","Direção de poses","15 fotos editadas","Galeria por 90 dias"]),
  pack("personal","Personal","Mais variedade para contar sua história.",650,1.5,35,["Até duas localizações próximas","Até três looks","35 fotos editadas","Galeria por 180 dias"],true),
  pack("experience","Experience","Uma produção completa e personalizada.",950,2.5,60,["Planejamento visual","Até três localizações","Trocas livres dentro do período","60 fotos e entrega prioritária"])
 ]},
 {slug:"casal",name:"Ensaio de casal",short:"Conexão, afeto e momentos naturais.",description:"Ensaios de namoro, noivado, pré-wedding e celebrações a dois.",image:"/images/services/casal.webp",packages:[
  pack("conexao","Conexão","Um encontro leve para guardar.",450,1,25,["Uma localização","Direção natural","25 fotos editadas","Galeria por 90 dias"]),
  pack("historia","História","Mais cenários e possibilidades.",750,1.5,45,["Duas localizações próximas","Até duas trocas de roupa","45 fotos editadas","Galeria por 180 dias"],true),
  pack("romance","Romance","Experiência completa para noivado ou pré-wedding.",1100,3,70,["Roteiro personalizado","Até três localizações","70 fotos editadas","Galeria por 365 dias"])
 ]},
 {slug:"gestante",name:"Gestante",short:"A espera registrada com delicadeza.",description:"Uma experiência acolhedora para eternizar uma fase única da família.",image:"/images/services/gestante.webp",packages:[
  pack("doce-espera","Doce Espera","Delicado e essencial.",500,1,25,["Uma localização e até dois looks","Fotos individuais e com acompanhante","25 fotos editadas","Galeria por 90 dias"]),
  pack("encanto","Encanto","A família inteira participa.",850,1.5,45,["Até três looks","Gestante, casal e filhos","45 fotos editadas","Galeria por 180 dias"],true),
  pack("memorias","Memórias","Produção completa dessa fase única.",1250,2.5,70,["Planejamento personalizado","Duas localizações próximas","Até quatro looks","70 fotos editadas e galeria por 365 dias"])
 ]},
 {slug:"familia",name:"Família",short:"Memórias verdadeiras entre gerações.",description:"Ensaios leves e espontâneos para famílias de todos os tamanhos.",image:"/images/services/familia.webp",packages:[
  pack("essencial","Essencial","Um encontro para até quatro pessoas.",500,1,25,["Uma localização","Até quatro pessoas","25 fotos editadas","Galeria por 90 dias"]),
  pack("lacos","Laços","Mais tempo para diferentes combinações.",850,1.5,45,["Até seis pessoas","Duas composições ou cenários","45 fotos editadas","Galeria por 180 dias"],true),
  pack("geracoes","Gerações","A família completa em uma experiência.",1300,2.5,80,["Até dez pessoas","Fotos gerais, por núcleo e individuais","80 fotos editadas","Galeria por 365 dias"])
 ]},
 {slug:"aniversario",name:"Aniversários",short:"Cada abraço, surpresa e comemoração.",description:"Cobertura fotográfica de aniversários infantis, adultos e celebrações especiais.",image:"/images/services/aniversario.webp",packages:[
  pack("celebracao","Celebração","Os momentos principais da festa.",650,2,100,["Parabéns, decoração e convidados","Mínimo de 100 fotos editadas","Galeria por 90 dias"]),
  pack("festa","Festa","Do início ao parabéns, com mais espontâneas.",1100,4,220,["Recepção e momentos principais","Mínimo de 220 fotos editadas","Galeria por 180 dias"],true),
  pack("completo","Completo","A história inteira da comemoração.",1650,6,350,["Cobertura completa","Retratos, detalhes e espontâneas","Mínimo de 350 fotos","Galeria por 365 dias"])
 ]},
 {slug:"corporativo",name:"Corporativo",short:"Imagem profissional para pessoas e empresas.",description:"Retratos profissionais, equipes, ambientes e eventos corporativos.",image:"/images/services/corporativo.webp",packages:[
  pack("perfil","Perfil","Atualize sua presença profissional.",550,.75,15,["Uma pessoa e um ambiente","Direção de poses","15 retratos editados","Uso digital profissional"]),
  pack("autoridade","Autoridade","Banco de imagens para site e redes.",950,1.5,40,["Até três pessoas","Retratos e ambiente de trabalho","40 fotos editadas","Licença institucional"],true),
  pack("empresa","Empresa","Equipe e rotina da marca.",1800,4,100,["Até dez profissionais","Retratos, equipe e rotina","100 fotos organizadas por colaborador","Licença institucional"])
 ]},
 {slug:"automotivo",name:"Automotivo",short:"Máquinas, detalhes e cultura automotiva.",description:"Ensaios de veículos e cobertura completa de encontros automotivos.",image:"/images/services/automotivo.webp",packages:[
  pack("street","Street","Seu carro, sua identidade.",350,.75,15,["Um veículo e uma localização","Fotos gerais e detalhes","15 fotos editadas","Galeria por 90 dias"]),
  pack("motion","Motion","Mais cenários e movimento.",650,1.5,35,["Um veículo e duas localizações próximas","Veículo, detalhes e proprietário","Movimento quando houver segurança","35 fotos editadas"],true),
  pack("signature","Signature","Um grupo automotivo em destaque.",1100,3,70,["Até cinco veículos","Até duas localizações próximas","Fotos individuais e do grupo","Detalhes, proprietários e movimento","70 fotos e galeria por 180 dias"]),
  pack("evento","Cobertura de Evento","Conteúdo completo para organizadores e participantes.",1800,6,350,["Chegada, público, expositores e atrações","Premiação, organizadores e patrocinadores","Mínimo de 350 fotos editadas","Galeria institucional por 365 dias","Álbum público preparado para venda individual"])
 ]}
];
export function serviceBySlug(slug:string){return SERVICE_CATALOG.find(service=>service.slug===slug)}
export function money(value:number){return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
