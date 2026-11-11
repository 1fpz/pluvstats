import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  Droplets,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Waves,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { buttonClass } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { InfoNotice } from '@/components/ui/InfoNotice'
import { territory } from '@/config'

const SAFE_ACTIONS = [
  'Afaste-se de ruas alagadas, córregos e passagens subterrâneas.',
  'Procure um local alto e seguro, longe de encostas e margens.',
  'Evite contato com a água: ela pode estar contaminada e esconder buracos.',
  'Oriente crianças e pessoas com dificuldade de locomoção a permanecerem em local seguro.',
  'Acione os canais oficiais de emergência do seu município.',
]

const RISKY_ACTIONS = [
  'Atravessar a pé ou de carro por água que cobre a via.',
  'Descer em bueiros, córregos ou galerias para tentar desobstruir.',
  'Tocar em postes, fios ou equipamentos elétricos próximos à água.',
  'Voltar a uma área alagada antes da liberação das autoridades.',
  'Usar este protótipo como se fosse um alerta oficial.',
]

const LIMITATIONS = [
  {
    title: 'Dados simulados por padrão',
    description:
      'O ambiente de demonstração usa séries geradas pelo próprio sistema. Nenhuma leitura exibida é uma medição física do território.',
  },
  {
    title: 'Hardware ainda não validado',
    description:
      'O dispositivo ESP32 planejado não passou por calibração de campo nem por testes de resistência à água. A área de hardware permanece bloqueada até existir uma leitura física validada.',
  },
  {
    title: 'Limites da medição ultrassônica',
    description:
      'Sensores HC-SR04 medem distância até a superfície, não vazão. Objetos, espuma, vento e inclinação podem gerar leituras inválidas ou imprecisas.',
  },
  {
    title: 'Limiares experimentais',
    description:
      'As faixas de atenção, alerta e crítico são valores de demonstração. Elas não foram validadas por Defesa Civil, órgão ambiental ou pesquisa de campo.',
  },
  {
    title: 'Sem integração institucional',
    description:
      'Não há conexão com a Prefeitura de Santo André, Defesa Civil, bombeiros ou qualquer central de emergência. Nenhuma equipe é despachada.',
  },
  {
    title: 'Persistência local',
    description:
      'No modo demonstrativo, o estado fica restrito a este ambiente (navegador ou banco local do protótipo). Limpar os dados ou reiniciar a demonstração restaura o conteúdo inicial.',
  },
]

function GuidanceList({ items, tone }) {
  const positive = tone === 'safe'
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[11.5px] leading-relaxed text-muted">
          <span
            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${positive ? 'bg-success' : 'bg-critical'}`}
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function CitizenInfoPage() {
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Orientações</p>
        <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-mist">Segurança e limites do protótipo</h1>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
          Leia antes de usar as informações deste ambiente demonstrativo em {territory.name}.
        </p>
      </header>

      <div className="rounded-lg border border-critical/25 bg-critical/[0.05] p-4">
        <div className="flex items-center gap-2 text-critical">
          <Phone className="h-4 w-4" aria-hidden="true" />
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em]">Risco imediato</p>
        </div>
        <p className="mt-2 text-[13px] font-medium text-mist">Ligue para os canais oficiais de emergência.</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
          No Brasil, acione o Corpo de Bombeiros (193) e a Defesa Civil (199). Para informações municipais, procure a
          Prefeitura de Santo André pelos canais oficiais. O PLUVSTATS não recebe chamadas nem despacha equipes.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="critical" size="xs">193 · Bombeiros</Badge>
          <Badge variant="critical" size="xs">199 · Defesa Civil</Badge>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-success/25">
          <CardHeader icon={ShieldCheck} title="Faça" description="Medidas gerais de proteção." />
          <CardBody className="p-4 pt-3">
            <GuidanceList items={SAFE_ACTIONS} tone="safe" />
          </CardBody>
        </Card>
        <Card className="border-critical/25">
          <CardHeader icon={AlertTriangle} title="Evite" description="Atitudes de risco em áreas alagadas." />
          <CardBody className="p-4 pt-3">
            <GuidanceList items={RISKY_ACTIONS} tone="risk" />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={Cpu}
          title="Como o PLUVSTATS funciona"
          description="Visão geral do conceito, sem alegar operação real."
        />
        <CardBody className="space-y-3 p-4 pt-3">
          {[
            {
              icon: Droplets,
              title: '1. Medição local',
              text: 'O protótipo prevê um sensor ultrassônico sobre o canal. A altura da água é obtida pela diferença entre a altura do sensor e a distância medida até a superfície.',
            },
            {
              icon: Cpu,
              title: '2. Classificação no dispositivo',
              text: 'O ESP32 planejado compara a leitura com limiares experimentais e aciona LED e buzzer localmente. Esse comportamento ainda não foi testado em campo.',
            },
            {
              icon: Database,
              title: '3. Consolidação e leitura',
              text: 'Leituras validadas seriam enviadas à API e consolidadas em alertas, ocorrências e indicadores. No modo demonstrativo, tudo é gerado e mantido neste ambiente; com a API local ativa, o estado fica no banco SQLite do protótipo.',
            },
          ].map((step) => (
            <div key={step.title} className="flex gap-3 rounded-lg border border-line bg-white/[0.02] p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.04] text-muted">
                <step.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-medium text-ink">{step.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{step.text}</p>
              </div>
            </div>
          ))}
          <p className="text-[10.5px] leading-relaxed text-muted">
            A fórmula de altura e a estimativa de tempo até um limite são documentadas no módulo de matemática do
            projeto. Elas são um apoio experimental, não uma previsão oficial de alagamento.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon={Info}
          title="Limitações conhecidas"
          description="Transparência sobre o que este protótipo não faz."
        />
        <CardBody className="space-y-3 p-4 pt-3">
          {LIMITATIONS.map((limitation) => (
            <div key={limitation.title} className="border-b border-line pb-3 last:border-0 last:pb-0">
              <p className="text-[12px] font-medium text-ink">{limitation.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{limitation.description}</p>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon={Database}
          title="Dados e privacidade"
          description="O que é coletado e onde fica armazenado."
        />
        <CardBody className="space-y-2 p-4 pt-3 text-[11.5px] leading-relaxed text-muted">
          <p>
            O formulário do cidadão não pede nome, documento, telefone, e-mail ou endereço residencial. O endereço
            informado deve ser apenas um ponto de referência público da ocorrência.
          </p>
          <p>
            No modo demonstrativo, ocorrências, intervenções, alertas e o estado do simulador ficam restritos a este
            ambiente: no <span className="text-ink">localStorage do navegador</span> ou no banco SQLite local da API.
            Não há envio para serviços de terceiros nem compartilhamento público entre dispositivos.
          </p>
          <p>
            A condição meteorológica exibida é consultada na Open-Meteo, um serviço externo, e não é uma leitura do
            sensor PLUVSTATS.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="cyan" size="xs">sem dados pessoais</Badge>
            <Badge variant="neutral" size="xs">persistência local</Badge>
            <Badge variant="neutral" size="xs">Open-Meteo externa</Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={HelpCircle} title="Perguntas frequentes" description="Respostas rápidas sobre o protótipo." />
        <CardBody className="space-y-2 p-4 pt-3">
          {[
            {
              question: 'O mapa mostra alagamentos reais?',
              answer:
                'Não. Sensores e ocorrências são demonstrativos. Nenhum ponto exibido deve ser interpretado como situação real da cidade.',
            },
            {
              question: 'Meu registro chega à prefeitura?',
              answer:
                'Não. O registro fica restrito a este ambiente demonstrativo e serve para demonstrar o fluxo do produto.',
            },
            {
              question: 'Por que o sistema diz que o hardware não está validado?',
              answer:
                'Porque não há leitura física calibrada e verificada. O sistema prefere declarar a ausência de dados a inventar uma conexão.',
            },
            {
              question: 'O que é o protocolo mostrado após o envio?',
              answer:
                'É um identificador demonstrativo do registro. Ele não tem validade oficial e pode ser apagado ao reiniciar a demonstração.',
            },
          ].map((item) => (
            <details key={item.question} className="group rounded-lg border border-line bg-white/[0.02] p-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-medium text-ink">
                {item.question}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted transition group-open:rotate-90" aria-hidden="true" />
              </summary>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </CardBody>
      </Card>

      <InfoNotice variant="demo" title="Protótipo acadêmico">
        O PLUVSTATS demonstra uma visão de monitoramento urbano de águas. Ele não é um produto oficial, não emite
        alertas oficiais e não substitui a Defesa Civil ou o Corpo de Bombeiros.
      </InfoNotice>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link to="/cidadao/registrar" className={buttonClass({ className: 'w-full' })}>
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Registrar ocorrência
        </Link>
        <Link to="/cidadao" className={buttonClass({ variant: 'secondary', className: 'w-full' })}>
          <Waves className="h-4 w-4" aria-hidden="true" />
          Voltar ao início
        </Link>
      </div>

      <p className="pb-2 text-center text-[10.5px] leading-relaxed text-muted">
        <BookOpen className="mr-1 inline h-3 w-3" aria-hidden="true" />
        Documentação e limitações detalhadas ficam na área do gestor e nos arquivos do projeto.
      </p>

      <div className="flex items-center justify-center gap-2 pb-2 text-[10.5px] text-muted">
        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
        Em caso de dúvida, priorize sempre os canais oficiais.
      </div>
    </div>
  )
}
