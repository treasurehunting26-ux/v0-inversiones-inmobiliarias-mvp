import type { Metadata } from "next"
import { Fraunces, IBM_Plex_Mono, Work_Sans } from "next/font/google"
import { VlmReveal } from "./vlm-reveal"
import "./villa.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-vlm-serif",
})
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-vlm-sans",
})
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-vlm-mono",
})

export const metadata: Metadata = {
  title: "Villa Los Monteros — Dossier Privado | Marbella Este",
}

const HERO_IMAGE =
  "https://cnujj30t80u2gqye.public.blob.vercel-storage.com/propiedades/fotos/Villa%20en%20Los%20Monteros%20Marbella.jpg"

export default function VillaLosMonterosPage() {
  return (
    <div
      className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} vlm`}
      style={{
        fontFamily: "var(--font-vlm-sans)",
      }}
    >
      <div className="wrapper">
        <div className="stamp-bar">
          <span className="kicker">Colección Privada</span>
          <span className="ref-code">DOSSIER N.º 07 — FUERA DE MERCADO</span>
        </div>

        <header className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="hero-media"
            src={HERO_IMAGE || "/placeholder.svg"}
            alt="Vista aérea de Villa Los Monteros con sus dos piscinas y jardín en niveles"
          />
          <div className="hero-overlay" />
          <div className="hero-inner">
            <span className="hero-eyebrow">Marbella Este · Costa del Sol</span>
            <h1 style={{ fontFamily: "var(--font-vlm-serif)" }}>
              Villa Los
              <br />
              Monteros
            </h1>
            <p className="hero-loc">Los Monteros, a pie de playa</p>
          </div>
        </header>

        <div className="main-body">
          <VlmReveal className="ledger">
            <div className="ledger-title">Ficha de la Propiedad</div>
            <div className="ledger-row">
              <span className="ledger-label">Suites en-suite</span>
              <span className="ledger-value">5</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-label">Baños + aseos de cortesía</span>
              <span className="ledger-value">5 + 2</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-label">Piscinas privadas</span>
              <span className="ledger-value">2</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-label">Cocinas — interior y exterior</span>
              <span className="ledger-value">2</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-label">Niveles habitables</span>
              <span className="ledger-value">4</span>
            </div>
            <div className="ledger-row">
              <span className="ledger-label">Acceso vertical</span>
              <span className="ledger-value">Ascensor privado</span>
            </div>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Presentación</span>
            <h2>
              Una casa que se habita <em>despacio</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="lede">
            <p>
              Hay residencias que se enseñan y otras que se relatan. Villa Los Monteros pertenece a esta segunda
              categoría: una propiedad de cuatro niveles concebida no como una suma de metros cuadrados, sino como
              una secuencia de instantes —la luz de la mañana entrando por el salón, el vapor de un baño de mármol al
              atardecer, el silencio de un jardín que solo comparten cinco suites. Esto es lo que se compra cuando se
              compra Los Monteros: tiempo, discreción y una forma de vivir que ya no se construye en ningún otro
              lugar de la Costa del Sol.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">El Enclave</span>
            <h2>
              Los Monteros, la dirección que <em>no necesita</em> presentación
            </h2>
          </VlmReveal>

          <VlmReveal className="coord-panel">
            <span className="kicker">Ubicación</span>
            <h3>Marbella Este, entre pinares y primera línea de playa</h3>
            <p>
              Hay direcciones que trascienden las modas. Los Monteros es, desde hace décadas, la urbanización más
              consolidada y cotizada de Marbella Este: avenidas arboladas, seguridad privada permanente y un
              silencio que solo se consigue con vecinos que valoran lo mismo que usted. Aquí no se busca ser visto;
              se busca estar en el lugar correcto.
            </p>
            <ul className="coord-list">
              <li>
                <span className="idx">01</span> A pocos minutos a pie de la playa y de La Cabane Beach Club
              </li>
              <li>
                <span className="idx">02</span> Flanqueada por los campos de Río Real, Santa Clara y Marbella Golf
              </li>
              <li>
                <span className="idx">03</span> Cinco minutos del Casco Histórico y del Hospital Costa del Sol
              </li>
              <li>
                <span className="idx">04</span> Vegetación mediterránea madura y perímetro plenamente privado
              </li>
            </ul>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Llegada</span>
            <h2>
              El umbral, <em>en movimiento</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar vídeo</span>
              <div className="slot-name">Recorrido de llegada</div>
              <span className="slot-spec">Horizontal o vertical · MP4 · sin audio</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              La piedra natural, la madera oscura y el juego de luz indirecta que recorre cada hueco de fachada
              anticipan, ya desde la calle, el lenguaje del resto de la casa: materiales nobles tratados con la
              contención de la buena arquitectura, sin un solo gesto superfluo.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Primer Instante</span>
            <h2>
              Un vestíbulo de <em>doble altura</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Vestíbulo — doble altura</div>
              <span className="slot-spec">Vertical</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              Se entra por un vestíbulo que asciende dos plantas sin interrupción. Una{" "}
              <strong>lámpara escultórica de cristal</strong>, suspendida como una lluvia congelada, ocupa el centro
              exacto del espacio, mientras el cristal de suelo a techo del fondo enmarca ya el jardín, la piscina y
              los pinos centenarios que definen el perímetro de la parcela. Es la primera de muchas veces en que esta
              casa hace que el exterior forme parte del relato interior.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Vida Social</span>
            <h2>
              El salón como <em>escenario de luz</em>
            </h2>
          </VlmReveal>

          <div className="narrative-grid">
            <VlmReveal className="slot tall">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Salón — chimenea</div>
                <span className="slot-spec">Vertical u horizontal</span>
              </div>
            </VlmReveal>
            <VlmReveal>
              <p className="editorial-p">
                Se entra y el techo se aleja. El salón principal se despliega en dos ambientes conectados, con una{" "}
                <strong>chimenea de piedra oscura</strong> como eje visual y una pieza de arte a gran escala que
                introduce color en una paleta por lo demás serena.
              </p>
              <p className="editorial-p">
                El espacio se abre después hacia los porches y el jardín a través de grandes puertas correderas de
                cristal, y la frontera entre dentro y fuera —tan buscada, tan rara vez lograda— desaparece por
                completo.
              </p>
              <div className="pull-quote">«Un salón que no decora la vida social: la organiza.»</div>
            </VlmReveal>
          </div>

          <VlmReveal className="slot tall">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Salón — hacia la terraza</div>
              <span className="slot-spec">Horizontal</span>
            </div>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Alta Gastronomía</span>
            <h2>
              Dos cocinas, <em>una sola filosofía</em>
            </h2>
          </VlmReveal>

          <div className="narrative-grid">
            <VlmReveal className="slot tall">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Cocina interior</div>
                <span className="slot-spec">Vertical u horizontal</span>
              </div>
            </VlmReveal>
            <VlmReveal>
              <p className="editorial-p">
                La isla curva en mármol es la protagonista: una pieza continua que fluye desde la zona de cocción
                hasta la mesa de madera maciza integrada, sin una sola junta que interrumpa la mirada. Frentes
                lacados sin tirador, ventanal de esquina y una segunda zona de trabajo en paralelo completan una
                cocina pensada tanto para el día a día como para el servicio de una cena a gran escala.
              </p>
            </VlmReveal>
          </div>

          <VlmReveal className="editorial-head">
            <span className="kicker">Vida Exterior</span>
            <h2>
              El porche como <em>segundo salón</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Porche — comedor exterior</div>
              <span className="slot-spec">Horizontal</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              Bajo el gran porche cubierto, una <strong>mesa redonda para ocho</strong> convierte cada comida en un
              ritual con vistas al césped, la piscina y los jardines. Es aquí donde la cocina exterior encuentra su
              sentido completo: servicio, sombra y un clima que en Marbella permite vivir a la intemperie casi todo
              el año.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Zona Nocturna</span>
            <h2>
              Cinco <em>refugios</em> privados
            </h2>
          </VlmReveal>
          <VlmReveal className="lede">
            <p>
              La villa reúne cinco dormitorios pensados no como habitaciones, sino como suites independientes: cada
              una con su propia atmósfera, su propio cuarto de baño y su propia salida al exterior. La suite
              principal se abre a un ventanal de suelo a techo con vista a los pinos, y su cabecero tapizado en
              textura orgánica introduce calidez frente al blanco general de la casa.
            </p>
          </VlmReveal>

          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Suite principal</div>
              <span className="slot-spec">Horizontal</span>
            </div>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Orden Silencioso</span>
            <h2>
              Un vestidor a <em>medida</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Vestidor principal</div>
              <span className="slot-spec">Horizontal</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              Contiguo a la suite principal, un vestidor completo en madera natural con iluminación integrada
              organiza cada prenda con la misma disciplina que rige el resto de la casa: nada a la vista, todo a
              mano.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Rituales de Spa</span>
            <h2>
              Baños tallados en <em>mármol</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Baño en suite</div>
              <span className="slot-spec">Horizontal</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              Cada suite dispone de baño propio, revestido en mármol de vetas continuas, con{" "}
              <strong>dobles lavabos simétricos</strong>, mampara de ducha independiente y una composición de espejos
              que multiplica la luz natural de la ventana central. Dos aseos de cortesía adicionales atienden a las
              visitas en la planta social, de modo que la intimidad de las suites nunca se comparte.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Oasis de Agua</span>
            <h2>
              Dos piscinas, <em>dos horizontes</em>
            </h2>
          </VlmReveal>

          <div className="narrative-grid">
            <VlmReveal className="slot tall">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Piscina del jardín</div>
                <span className="slot-spec">Horizontal · día</span>
              </div>
            </VlmReveal>
            <VlmReveal>
              <p className="editorial-p">
                La piscina principal se extiende junto al césped, flanqueada por tumbonas y con la fachada trasera de
                la villa —abierta de par en par al jardín— como telón de fondo. Es la piscina de las mañanas, la que
                se ve desde el salón y desde la cocina.
              </p>
            </VlmReveal>
          </div>

          <VlmReveal className="slot xl">
            <div className="slot-inner">
              <span className="slot-tag">Insertar foto</span>
              <div className="slot-name">Piscina del solárium</div>
              <span className="slot-spec">Horizontal · noche</span>
            </div>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              En la azotea, una <strong>segunda piscina privada</strong> se transforma de noche en el momento más
              cinematográfico de la casa: iluminación azul, vegetación retroiluminada y una escalinata de madera que
              desciende hacia ella como una invitación. Es la piscina de las otras horas: el atardecer, una copa, el
              silencio.
            </p>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Ingeniería de Espacios</span>
            <h2>
              Anatomía de <em>cuatro niveles</em>
            </h2>
          </VlmReveal>

          <VlmReveal className="section-elevation">
            <div className="level">
              <div className="level-tag">Nivel 04 — Azotea privada</div>
              <div className="level-title">Solárium &amp; piscina elevada</div>
              <div className="level-desc">
                Terraza panorámica reservada para tomar el sol en absoluta intimidad y para las veladas de atardecer
                con vistas despejadas.
              </div>
            </div>
            <div className="level">
              <div className="level-tag">Nivel 03 — Primera planta</div>
              <div className="level-title">Zona nocturna &amp; vestidores</div>
              <div className="level-desc">
                Suites principales con baño en-suite y vestidor a medida, apartadas de la vida social de la planta
                baja.
              </div>
            </div>
            <div className="level">
              <div className="level-tag">Nivel 02 — Planta principal</div>
              <div className="level-title">Vida social, porche &amp; jardines</div>
              <div className="level-desc">
                Vestíbulo de doble altura, salón con chimenea, cocina interior gourmet, porche con comedor exterior,
                jardín y piscina principal.
              </div>
            </div>
            <div className="level">
              <div className="level-tag">Nivel 01 — Sótano multifuncional</div>
              <div className="level-title">Ocio, servicios &amp; salas técnicas</div>
              <div className="level-desc">
                Nivel polivalente personalizable —gimnasio, cine o spa—, lavandería independiente, sala de máquinas y
                trasteros.
              </div>
            </div>
          </VlmReveal>

          <VlmReveal className="editorial-head">
            <span className="kicker">Ingeniería Invisible</span>
            <h2>
              Confort que <em>no se ve</em>
            </h2>
          </VlmReveal>
          <VlmReveal className="editorial-p">
            <p>
              El verdadero lujo de Los Monteros es el que no se fotografía: suelo radiante integral, aerotermia,
              domótica avanzada y un ascensor privado que conecta los cuatro niveles sin esfuerzo. Es la ingeniería
              que sostiene, en silencio, cada uno de los instantes anteriores.
            </p>
          </VlmReveal>

          <VlmReveal className="tech-list">
            <div className="tech-row">
              <span className="tech-name">Ascensor privado</span>
              <span className="tech-mark">04 NIVELES</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Suelo radiante integral</span>
              <span className="tech-mark">TOTAL</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Sistema de aerotermia</span>
              <span className="tech-mark">EFICIENTE</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Domótica avanzada</span>
              <span className="tech-mark">INTEGRADA</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Doble cocina interior / exterior</span>
              <span className="tech-mark">2</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Doble piscina privada</span>
              <span className="tech-mark">2</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Vestidor a medida</span>
              <span className="tech-mark">SUITE PPAL.</span>
            </div>
            <div className="tech-row">
              <span className="tech-name">Sótano multifuncional</span>
              <span className="tech-mark">1 NIVEL</span>
            </div>
          </VlmReveal>

          <VlmReveal className="gallery-head editorial-head">
            <span className="kicker">Recorrido Visual</span>
            <h2>
              Postales de <em>Los Monteros</em>
            </h2>
          </VlmReveal>

          <VlmReveal className="masonry">
            <div className="slot large">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Fachada</div>
              </div>
            </div>
            <div className="slot">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Salón</div>
              </div>
            </div>
            <div className="slot">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Cocina</div>
              </div>
            </div>
            <div className="slot">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Baño</div>
              </div>
            </div>
            <div className="slot">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Piscina — día</div>
              </div>
            </div>
            <div className="slot large">
              <div className="slot-inner">
                <span className="slot-tag">Insertar foto</span>
                <div className="slot-name">Piscina — noche</div>
              </div>
            </div>
          </VlmReveal>

          <VlmReveal className="footer-seal">
            <div className="seal-ring">
              <span>LM</span>
            </div>
            <div className="footer-title">Los Monteros, Marbella Este</div>
            <div className="footer-sub">Presentación privada de propiedad</div>
            <p className="footer-note">
              Dossier confidencial. Información y disponibilidad sujetas a verificación directa con la propiedad. No
              constituye oferta pública.
            </p>
          </VlmReveal>
        </div>
      </div>
    </div>
  )
}
