from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import BaseDocTemplate, Frame, Image, KeepTogether, PageTemplate, Paragraph, Spacer, Table, TableStyle
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)
LOGO = ROOT / "public" / "images" / "logo.png"
RED = colors.HexColor("#e30613")
INK = colors.HexColor("#151515")
MUTED = colors.HexColor("#5e5e5e")

STUDIO = [
    ("1. Objeto", "O presente instrumento regula a prestação de serviços fotográficos pela M&M Fotografias, conforme categoria, pacote, data, duração, local e entregas descritos na proposta comercial aceita, que integra este contrato."),
    ("2. Reserva e pagamento", "A data será reservada após o aceite e o pagamento do sinal indicado na proposta. O saldo deverá ser pago no prazo acordado. Atrasos podem suspender a cobertura, a edição ou a entrega, sem apagar valores já vencidos."),
    ("3. Obrigações das partes", "A CONTRATADA realizará o serviço com técnica, cuidado e linguagem visual compatíveis com seu portfólio. O CONTRATANTE fornecerá informações corretas, autorizações de acesso, horários, contatos e condições mínimas para execução segura do trabalho."),
    ("4. Alteração, atraso e cancelamento", "Mudanças dependem de disponibilidade e confirmação escrita. Atrasos do evento não prorrogam automaticamente a cobertura. Cancelamentos, remarcações e situações de força maior observarão os valores, prazos e despesas efetivamente assumidos."),
    ("5. Seleção, edição e entrega", "A curadoria e a edição seguem o padrão autoral da M&M Fotografias. Arquivos brutos não integram a entrega, salvo ajuste expresso. Quantidade, formato, galeria privada e prazo serão os da proposta, contados após a seleção e a quitação quando aplicável."),
    ("6. Galeria e guarda", "A galeria privada ficará disponível pelo período informado. O CONTRATANTE deverá baixar e manter cópia dos arquivos antes do vencimento. Após esse prazo, a guarda não é garantida, embora possa ser prorrogada por acordo escrito."),
    ("7. Direitos autorais e imagem", "A autoria permanece com os fotógrafos. A publicação para portfólio e divulgação depende da autorização registrada na proposta ou em termo próprio. O uso comercial por terceiros exige autorização. O CONTRATANTE declara possuir consentimento das pessoas sob sua responsabilidade."),
    ("8. Privacidade e LGPD", "Dados pessoais serão usados para orçamento, execução, pagamento, suporte, entrega e obrigações legais, com acesso restrito e medidas razoáveis de segurança. Solicitações de acesso, correção ou eliminação poderão ser feitas pelos canais oficiais, observadas as bases legais de retenção."),
    ("9. Aceite eletrônico e foro", "O aceite eletrônico, com identificação, data, endereço IP e registro técnico, expressa concordância com este instrumento. As partes buscarão solução amigável e, se necessário, elegem o foro da comarca de Rio Claro/SP, ressalvadas regras legais de competência."),
]

PRO = [
    ("1. Objeto da colaboração", "O PROFISSIONAL prestará serviços fotográficos em trabalhos indicados e aceitos individualmente, como profissional independente, sem exclusividade e sem vínculo empregatício, observando briefing, escala, horário, local e escopo confirmados."),
    ("2. Disponibilidade e conduta", "Cada convocação dependerá de aceite. O PROFISSIONAL compromete-se com pontualidade, apresentação adequada, respeito à equipe e ao cliente, preservação da imagem da M&M e comunicação imediata de qualquer impedimento."),
    ("3. Padrão técnico e arquivos", "O trabalho seguirá o padrão técnico e visual combinado. Os arquivos deverão ser entregues de forma íntegra, organizada e dentro do prazo definido. É vedada a exclusão, retenção ou divulgação não autorizada de material do cliente."),
    ("4. Equipamentos e segurança", "O PROFISSIONAL é responsável por seus equipamentos, backups durante a cobertura e uso seguro. Despesas extraordinárias somente serão reembolsadas quando previamente autorizadas e comprovadas."),
    ("5. Comissão e repasse", "O valor ou percentual de cada trabalho será informado antes do aceite da escala. O repasse ocorrerá conforme a confirmação do serviço, entrega dos arquivos e calendário financeiro registrado no painel, descontados adiantamentos ou ajustes autorizados."),
    ("6. Direitos autorais e portfólio", "A autoria é reconhecida. O uso em portfólio pessoal depende da publicação autorizada pelo cliente e pela M&M, respeitando embargo, privacidade, marca e contexto. A licença necessária à edição, entrega e divulgação autorizada é concedida à M&M."),
    ("7. Sigilo e proteção de dados", "Dados de clientes, preços, acessos, conversas, arquivos e processos internos são confidenciais. O PROFISSIONAL usará essas informações somente para o trabalho, não compartilhará credenciais e comunicará incidentes imediatamente, observando a LGPD."),
    ("8. Cancelamento e encerramento", "Impedimentos devem ser comunicados com antecedência razoável. Faltas injustificadas, violação de sigilo, conduta incompatível ou não entrega poderão encerrar a colaboração e gerar apuração de prejuízos. Trabalhos concluídos permanecem sujeitos às obrigações deste termo."),
    ("9. Aceite eletrônico", "Este modelo passa a existir automaticamente quando o cargo de Fotógrafo é concedido no sistema. A relação somente é formalizada após geração do termo individual e aceite eletrônico do PROFISSIONAL, com registro de identificação, data e evidências técnicas."),
]

class ContractDoc(BaseDocTemplate):
    def __init__(self, filename, title, party):
        super().__init__(filename, pagesize=A4, leftMargin=22*mm, rightMargin=22*mm, topMargin=36*mm, bottomMargin=25*mm, title=title, author="M&M Fotografias")
        self.contract_title = title
        self.party = party
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="body")
        self.addPageTemplates(PageTemplate(id="contract", frames=frame, onPage=self.decorate))

    def decorate(self, canvas: Canvas, doc):
        w, h = A4
        canvas.saveState()
        canvas.setStrokeColor(RED); canvas.setLineWidth(1.8)
        canvas.roundRect(10*mm, 10*mm, w-20*mm, h-20*mm, 3*mm, stroke=1, fill=0)
        canvas.setFillColor(colors.Color(0.9, 0.02, 0.07, alpha=0.035))
        canvas.setFont("Helvetica-Bold", 48)
        canvas.translate(w/2, h/2); canvas.rotate(35)
        canvas.drawCentredString(0, 0, "M&M FOTOGRAFIAS")
        canvas.restoreState()
        if LOGO.exists():
            canvas.setFillColor(INK)
            canvas.roundRect(20*mm, h-31*mm, 48*mm, 20*mm, 2*mm, fill=1, stroke=0)
            canvas.drawImage(str(LOGO), 23*mm, h-29.5*mm, width=42*mm, height=17*mm, preserveAspectRatio=True, mask="auto")
        canvas.setFillColor(RED); canvas.rect(w-66*mm, h-24*mm, 44*mm, 2.2*mm, fill=1, stroke=0)
        canvas.setFillColor(MUTED); canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(w-22*mm, 16*mm, f"M&M Fotografias  •  Modelo 2026.08  •  Página {doc.page}")

def make_pdf(path, title, subtitle, parties, clauses, signer):
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("TitleMM", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=21, leading=24, textColor=INK, alignment=TA_CENTER, spaceAfter=3*mm)
    subtitle_style = ParagraphStyle("SubtitleMM", parent=styles["Normal"], fontSize=8.5, leading=11, textColor=RED, alignment=TA_CENTER, spaceAfter=7*mm, uppercase=True)
    heading = ParagraphStyle("HeadingMM", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=10.5, leading=13, textColor=RED, spaceBefore=3*mm, spaceAfter=1.5*mm)
    body = ParagraphStyle("BodyMM", parent=styles["BodyText"], fontSize=8.8, leading=13, textColor=INK, alignment=4)
    small = ParagraphStyle("SmallMM", parent=body, fontSize=7.8, leading=10.5, textColor=MUTED)
    doc = ContractDoc(str(path), title, parties[-1][1])
    story = [Spacer(1, 3*mm), Paragraph(escape(title), title_style), Paragraph(escape(subtitle.upper()), subtitle_style)]
    table = Table([[Paragraph(f"<b>{escape(k)}</b>", small), Paragraph(escape(v), body)] for k,v in parties], colWidths=[37*mm, 112*mm], hAlign="CENTER")
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(0,-1),colors.HexColor("#f3f3f3")),("BOX",(0,0),(-1,-1),0.6,colors.HexColor("#d2d2d2")),("INNERGRID",(0,0),(-1,-1),0.35,colors.HexColor("#dedede")),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story += [table, Spacer(1, 4*mm)]
    for h, text in clauses:
        story.append(KeepTogether([Paragraph(escape(h), heading), Paragraph(escape(text), body)]))
    story += [Spacer(1, 8*mm), Paragraph("DECLARAÇÃO E ASSINATURAS", heading), Paragraph("As partes declaram que leram, compreenderam e concordam com as condições deste modelo. Os campos finais serão preenchidos na geração eletrônica de cada contrato.", body), Spacer(1, 12*mm)]
    signs = Table([["________________________________", "________________________________"], [signer, "M&M FOTOGRAFIAS"], ["Data: ____/____/________", "Data: ____/____/________"]], colWidths=[74*mm,74*mm], hAlign="CENTER")
    signs.setStyle(TableStyle([("ALIGN",(0,0),(-1,-1),"CENTER"),("FONTNAME",(0,1),(-1,1),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),8),("TEXTCOLOR",(0,2),(-1,2),MUTED),("TOPPADDING",(0,0),(-1,-1),3)]))
    story += [signs, Spacer(1, 6*mm), Paragraph("Modelo contratual operacional. Recomenda-se revisão por profissional jurídico antes do uso definitivo, especialmente após alterações de preço, escopo, município ou política comercial.", small)]
    doc.build(story)

make_pdf(OUT/"modelo-contrato-mm-fotografias.pdf", "CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS", "Documento contratual M&M Fotografias", [("CONTRATADA", "M&M Fotografias"),("CONTRATANTE", "[NOME COMPLETO DO CLIENTE]"),("SERVIÇO", "[PACOTE / DATA / LOCAL / VALOR]")], STUDIO, "[NOME COMPLETO DO CLIENTE]")
for slug, name in [("theus-eigenheer","Theus Eigenheer"),("maria-vittoria-maniero-da-silva","Maria Vittoria Maniero da Silva"),("natanael-henrique","Natanael Henrique")]:
    make_pdf(OUT/f"modelo-termo-fotografo-{slug}.pdf", "TERMO INDIVIDUAL DE PRESTAÇÃO DE SERVIÇOS", "Colaborador fotógrafo M&M", [("CONTRATANTE", "M&M Fotografias"),("PROFISSIONAL", name),("FUNÇÃO", "Fotógrafo(a) / colaborador(a) independente")], PRO, name)
