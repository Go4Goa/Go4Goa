import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  MapPin,
  Map,
  Camera,
  Users,
  Heart,
  Check,
  X,
  Menu,
  Plus,
  Minus,
  Trash2,
  Construction,
  Droplets,
  Lightbulb,
  CalendarDays,
  ShieldCheck,
  Pause,
  Play,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);
const assets = "/assets/";
const appUrl = import.meta.env.DEV ? "http://127.0.0.1:4310/map" : "/map";
const features = [
  {
    name: "Map",
    icon: Map,
    title: "A little local knowledge.",
    description: "See nearby reports and meetups in one shared view.",
  },
  {
    name: "Document",
    icon: Camera,
    title: "Make the unseen visible.",
    description: "A photo, a place, and a few words can start something.",
  },
  {
    name: "Meetups",
    icon: Users,
    title: "Good things happen together.",
    description: "Find your people. Make a plan. Show up for your Goa.",
  },
  {
    name: "Resources",
    icon: BookOpen,
    title: "Know your next step.",
    description: "Find practical guidance for waste and infrastructure.",
  },
];
const categories: { name: string; icon: LucideIcon; description: string }[] = [
  { name: "Waste", icon: Trash2, description: "Waste beside the beach access" },
  {
    name: "Roads",
    icon: Construction,
    description: "Pothole near the junction",
  },
  { name: "Water", icon: Droplets, description: "Leaking water pipe" },
  { name: "Lighting", icon: Lightbulb, description: "Streetlight not working" },
];
const faq = [
  [
    "What is Go4Goa?",
    "Go4Goa is a civic app for people who care about Goa. Document trash and infrastructure issues, discover local meetups, and find practical resources to take the next step.",
  ],
  [
    "What happens when I document an issue?",
    "You add a photo, location and description. Reports go through moderation before appearing publicly. Updates can show whether an issue is verified, in progress or resolved. A report does not guarantee action by an authority.",
  ],
  [
    "Can I keep my exact location private?",
    "Yes. The app supports an approximate public location for a report. Your phone number stays private, and your public identity is a username.",
  ],
  [
    "Can I organize a meetup?",
    "Signed-in organizers can create a public meetup with a time, place, capacity and useful instructions. Published meetups have their own page and share link.",
  ],
  [
    "Is this the live app?",
    "This homepage introduces Go4Goa through interactive examples. These examples are fictional: nothing in the preview submits a report, joins an event, or sends a notification.",
  ],
];
function Brand({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? "brand brand-large" : "brand"}>
      go4goa
      <ArrowUpRight aria-hidden="true" />
    </span>
  );
}
function Action({
  href = appUrl,
  children = "Explore the app",
  light = false,
}: {
  href?: string;
  children?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <a className={`action ${light ? "action-light" : ""}`} href={href}>
      <span>{children}</span>
      <ArrowUpRight size={19} aria-hidden="true" />
    </a>
  );
}
function Charm({
  icon: Icon,
  tone = "green",
  className = "",
}: {
  icon: LucideIcon;
  tone?: string;
  className?: string;
}) {
  return (
    <span className={`charm charm-${tone} ${className}`} aria-hidden="true">
      <Icon strokeWidth={1.6} />
    </span>
  );
}
function ReportDemo({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(0);
  const [review, setReview] = useState(false);
  const Category = categories[selected].icon;
  return (
    <div className={`report-demo ${compact ? "compact" : ""}`}>
      <div className="preview-heading">
        <Camera size={19} />
        <span>Document an issue</span>
        <span className="example-tag">Demo</span>
      </div>
      <div className="report-photo">
        <img
          src={assets + "vagator.webp"}
          alt="Coconut palms overlooking Goa's rocky coast"
          loading="lazy"
        />
        <span>
          <Camera size={15} /> Example location photo
        </span>
      </div>
      <div className="report-body">
        <h3>What needs a little care?</h3>
        <div className="category-options" aria-label="Example report category">
          {categories.map((c, i) => (
            <button
              key={c.name}
              aria-pressed={selected === i}
              onClick={() => {
                setSelected(i);
                setReview(false);
              }}
            >
              <c.icon size={21} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        <div className="report-detail" aria-live="polite">
          <Category size={19} />
          <span>{categories[selected].description}</span>
        </div>
        <div className="privacy-line">
          <MapPin size={16} />
          <span>Miramar, Goa</span>
          <span>Approximate location</span>
        </div>
        <button className="demo-primary" onClick={() => setReview(!review)}>
          {review ? (
            <>
              <Check size={17} /> Example ready for review
            </>
          ) : (
            <>
              Preview the next step <ArrowRight size={17} />
            </>
          )}
        </button>
        <p className="demo-note" aria-live="polite">
          {review
            ? "In the app, a moderator reviews your report before it goes public. Nothing has been submitted."
            : "Fictional example. Try a category to see how it works."}
        </p>
      </div>
    </div>
  );
}
function MeetupDemo({ compact = false }: { compact?: boolean }) {
  const [palette, setPalette] = useState(0);
  const [joined, setJoined] = useState(false);
  const palettes = ["#193e32", "#24596e", "#a64430"];
  return (
    <div className={`meetup-demo ${compact ? "compact" : ""}`}>
      <div className="poster" style={{ background: palettes[palette] }}>
        <span className="poster-brand">
          go4goa
          <ArrowUpRight size={19} />
        </span>
        <div className="poster-title">
          A cleaner
          <br />
          Miramar
          <br />
          morning.
        </div>
        <div className="poster-meta">
          <span>
            <CalendarDays size={18} /> Sunday · 7:00 am
          </span>
          <span>
            <MapPin size={18} /> Miramar beach, Goa
          </span>
          <span>
            <Users size={18} /> Bring a friend. Make a difference.
          </span>
        </div>
        <span className="poster-example">Example meetup</span>
      </div>
      <div className="poster-tools">
        <div className="swatches" aria-label="Poster colour">
          {palettes.map((color, i) => (
            <button
              key={color}
              style={{ background: color }}
              aria-label={["Forest poster", "Ocean poster", "Clay poster"][i]}
              aria-pressed={palette === i}
              onClick={() => setPalette(i)}
            >
              {palette === i && <Check size={16} />}
            </button>
          ))}
        </div>
        <button className="poster-join" onClick={() => setJoined(!joined)}>
          {joined ? (
            <>
              <Check size={17} /> On the demo list
            </>
          ) : (
            <>
              Count me in <ArrowUpRight size={17} />
            </>
          )}
        </button>
      </div>
      <p className="demo-note" aria-live="polite">
        {joined
          ? "You joined the fictional demo list. No real RSVP was sent."
          : "Try a colour. Make the invitation yours."}
      </p>
    </div>
  );
}
function ResourceDemo() {
  const [active, setActive] = useState("Waste");
  return (
    <div className="resource-demo">
      <BookOpen size={34} />
      <h3>
        A next step,
        <br />
        closer to home.
      </h3>
      <div className="resource-switch">
        {["Waste", "Infrastructure"].map((x) => (
          <button
            key={x}
            onClick={() => setActive(x)}
            aria-pressed={active === x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="resource-rows">
        {(active === "Waste"
          ? [
              "Separate your waste",
              "Find collection guidance",
              "Organize a cleanup",
            ]
          : [
              "Document the problem",
              "Find the right department",
              "Follow up with context",
            ]
        ).map((x, i) => (
          <div key={x}>
            <span>{x}</span>
            <CheckCircle2 size={18} />
          </div>
        ))}
      </div>
      <p>Guidance and source-backed resources from ActForGoa.</p>
      <a href="https://actforgoa.org" target="_blank" rel="noreferrer">
        Explore ActForGoa <ArrowUpRight size={17} />
      </a>
    </div>
  );
}
function MapDemo() {
  const [place, setPlace] = useState(0);
  return (
    <div className="map-demo">
      <img
        src={assets + "app-map.webp"}
        alt="Actual Go4Goa app screenshot showing fictional civic reports and meetups around Panaji, Miramar and Caranzalem"
        loading="lazy"
      />
      <div className="map-caption">
        <MapPin size={16} />
        <span>Goa, a little closer.</span>
        <span className="example-tag">App screenshot · demo data</span>
      </div>
      <div className="map-selection">
        <div className="map-selection-tabs">
          {["Report", "Meetup"].map((x, i) => (
            <button
              key={x}
              aria-pressed={place === i}
              onClick={() => setPlace(i)}
            >
              {x}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <strong>
            {place === 0
              ? "Waste beside the beach access"
              : "A cleaner Miramar morning"}
          </strong>
          <span>
            {place === 0
              ? "Miramar · Verified example"
              : "Miramar beach · Example meetup"}
          </span>
        </div>
        <a
          href={place === 0 ? "#document" : "#meetups"}
          aria-label={
            place === 0 ? "Explore documenting an issue" : "Explore meetups"
          }
        >
          <ArrowUpRight size={22} />
        </a>
      </div>
    </div>
  );
}
function ProductDemo() {
  const [tab, setTab] = useState(0);
  return (
    <div className="product-demo">
      <div className="product-toolbar">
        <Brand />
        <div
          className="product-tabs"
          role="tablist"
          aria-label="Explore app features"
        >
          {features.map((f, i) => (
            <button
              id={`feature-tab-${i}`}
              key={f.name}
              role="tab"
              aria-selected={tab === i}
              aria-controls="feature-panel"
              tabIndex={tab === i ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const next = (tab + (e.key === "ArrowRight" ? 1 : 3)) % 4;
                  setTab(next);
                  document.getElementById(`feature-tab-${next}`)?.focus();
                }
              }}
              onClick={() => setTab(i)}
            >
              <f.icon size={17} />
              <span>{f.name}</span>
            </button>
          ))}
        </div>
        <span className="product-demo-label">Interactive demo</span>
      </div>
      <div
        key={tab}
        id="feature-panel"
        role="tabpanel"
        aria-labelledby={`feature-tab-${tab}`}
        className={`product-panel product-panel-${tab}`}
      >
        {tab === 0 ? (
          <MapDemo />
        ) : tab === 1 ? (
          <ReportDemo compact />
        ) : tab === 2 ? (
          <MeetupDemo compact />
        ) : (
          <ResourceDemo />
        )}
      </div>
    </div>
  );
}

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(false);
  const reduced = systemReduced || paused;
  const [accordion, setAccordion] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const gallery = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const fn = () => setScrolled(scrollY > 90);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);
  useLayoutEffect(() => {
    if (!root.current) return;
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.08,
        smoothWheel: true,
        // Only consume wheel input inside previews while they can actually scroll.
        allowNestedScroll: true,
        syncTouch: false,
        anchors: { offset: 0 },
      });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
    }
    const media = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (reduced) return;
      gsap.from(".hero-art", {
        y: -35,
        rotation: -6,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
      gsap.from(".hero-line", {
        y: 55,
        opacity: 0,
        filter: "blur(6px)",
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        delay: 0.15,
      });
      gsap.to(".hero-art", {
        yPercent: 18,
        rotation: 5,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.utils.toArray<HTMLElement>(".reveal-heading").forEach((el) => {
        gsap.from(el.querySelectorAll(".reveal-word"), {
          opacity: 0.18,
          filter: "blur(5px)",
          y: 12,
          stagger: 0.035,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
      media.add("(min-width: 900px)", () => {
        const charms = gsap.utils.toArray<HTMLElement>(".travel-charm");
        const targets = gsap.utils.toArray<SVGElement>(
          ".product-tabs button > svg",
        );
        const product = document.querySelector<HTMLElement>(
          ".connection-product",
        )!;
        let landings: { x: number; y: number; scale: number; color: string }[] =
          [];
        // Measure the final, untransformed toolbar on every layout refresh.
        // Preserve the current frame so a resize never jumps the scrubbed story.
        const measureLandings = () => {
          const saved = [product, ...charms].map((el) =>
            Object.fromEntries(
              ["x", "y", "yPercent", "scaleX", "scaleY", "rotation"].map(
                (key) => [key, gsap.getProperty(el, key)],
              ),
            ),
          );
          gsap.set(product, { y: 0, yPercent: 0, scale: 1 });
          gsap.set(charms, { x: 0, y: 0, scale: 1, rotation: 0 });
          landings = charms.map((charm, i) => {
            const source = charm.querySelector("svg")!.getBoundingClientRect();
            const destination = targets[i].getBoundingClientRect();
            return {
              x:
                destination.left +
                destination.width / 2 -
                source.left -
                source.width / 2,
              y:
                destination.top +
                destination.height / 2 -
                source.top -
                source.height / 2,
              scale: destination.width / source.width,
              color: getComputedStyle(targets[i]).color,
            };
          });
          [product, ...charms].forEach((el, i) => gsap.set(el, saved[i]));
        };
        measureLandings();
        ScrollTrigger.addEventListener("refreshInit", measureLandings);
        gsap.set(targets, { opacity: 0 });
        const tl = gsap.timeline({
          scrollTrigger: {
            id: "connection-demo",
            trigger: ".connection",
            pin: ".connection-stage",
            start: "top top",
            // Keep the handoff to about one screen of scroll, including short reading holds.
            end: () =>
              "+=" + gsap.utils.clamp(900, 1250, window.innerHeight * 1.35),
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });
        tl.to(
          ".connection-copy",
          { y: -100, opacity: 0, filter: "blur(7px)", duration: 0.22 },
          0.04,
        )
          .to(
            charms,
            {
              y: (i) => landings[i].y,
              x: (i) => landings[i].x,
              scale: (i) => landings[i].scale,
              rotation: 0,
              duration: 0.56,
              stagger: 0.025,
              ease: "power2.inOut",
            },
            0.22,
          )
          .fromTo(
            ".connection-product",
            { yPercent: 115, scale: 0.86, autoAlpha: 0 },
            {
              yPercent: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 0.5,
              ease: "power2.inOut",
            },
            0.16,
          )
          .to(
            charms,
            {
              backgroundColor: "transparent",
              boxShadow: "0 0 0 transparent",
              color: (i) => landings[i].color,
              duration: 0.3,
            },
            0.52,
          )
          .to(targets, { opacity: 1, duration: 0.08 }, 0.86)
          .to(charms, { opacity: 0, duration: 0.08 }, 0.86)
          .to(".connection-product", { duration: 0.1 });
        gsap.to(".journey-track", {
          x: () =>
            -(
              document.querySelector(".journey-track")!.scrollWidth -
              window.innerWidth
            ),
          ease: "none",
          scrollTrigger: {
            trigger: ".journey",
            pin: ".journey-stage",
            start: "top top",
            // Match the scroll budget to the actual horizontal distance.
            end: () =>
              "+=" +
              Math.max(
                900,
                document.querySelector(".journey-track")!.scrollWidth -
                  window.innerWidth,
              ),
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
        });
        return () =>
          ScrollTrigger.removeEventListener("refreshInit", measureLandings);
      });
      gsap.from(".wide-photo img", {
        scale: 1.16,
        scrollTrigger: {
          trigger: ".wide-photo",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        ease: "none",
      });
      gsap.from(".footer-brand", {
        yPercent: 25,
        scrollTrigger: {
          trigger: ".footer-brand",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
        ease: "none",
      });
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      media.revert();
      ctx.revert();
      lenis?.destroy();
      lenisRef.current = null;
      if (tick) gsap.ticker.remove(tick);
      window.removeEventListener("load", refresh);
    };
  }, [reduced]);
  const goToDemo = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as HTMLElement).closest("a");
    if (anchor?.getAttribute("href") !== "#explore") return;
    event.preventDefault();
    event.stopPropagation();
    const trigger = ScrollTrigger.getById("connection-demo");
    const el = document.getElementById("explore");
    if (!el) return;
    const target = trigger
      ? trigger.end - 24
      : el.getBoundingClientRect().top + window.scrollY - 105;
    setMenu(false);
    history.replaceState(null, "", "#explore");
    const focusDemo = () =>
      el
        .querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')
        ?.focus({ preventScroll: true });
    if (lenisRef.current)
      lenisRef.current.scrollTo(target, {
        duration: 1.15,
        onComplete: focusDemo,
      });
    else {
      window.scrollTo({
        top: target,
        behavior: reduced ? "instant" : "smooth",
      });
      focusDemo();
    }
  };
  const heading = (text: string) =>
    text.split(" ").map((w, i) => (
      <span className="reveal-word" key={i}>
        {w}{" "}
      </span>
    ));
  return (
    <div
      ref={root}
      onClickCapture={goToDemo}
      className={reduced ? "site reduced" : "site"}
    >
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav-capsule">
          <a href="#top" aria-label="Go4Goa home">
            <Brand />
          </a>
          <nav
            className="desktop-nav"
            inert={scrolled}
            aria-label="Main navigation"
          >
            <a href="#explore">The app</a>
            <a href="#document">Document</a>
            <a href="#meetups">Meetups</a>
            <a href="#resources">Resources</a>
          </nav>
          <button
            className="menu-toggle"
            ref={menuButton}
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="site-menu"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className="nav-action">
          <span>Made for Goa.</span>
          <Action />
        </div>
      </header>
      {menu && (
        <nav
          id="site-menu"
          className="expanded-menu"
          aria-label="Expanded navigation"
        >
          {[
            ["The app", "#explore"],
            ["Document an issue", "#document"],
            ["Find your people", "#meetups"],
            ["Useful resources", "#resources"],
            ["A few questions", "#questions"],
          ].map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenu(false)}>
              {label}
              <ArrowUpRight />
            </a>
          ))}
        </nav>
      )}
      <main id="main">
        <section className="hero" id="top">
          <div className="hero-art">
            <img
              src={assets + "go4goa-keychain.webp"}
              alt="Glossy Go4Goa keychain with a green location pin, silver camera, coral heart and palm tree"
              fetchPriority="high"
            />
          </div>
          <div className="hero-content">
            <h1>
              <span className="hero-line">Made for a</span>
              <span className="hero-line"> better Goa.</span>
            </h1>
            <p className="hero-line">
              The place we love. The people who make it better.
            </p>
            <div className="hero-line">
              <Action />
            </div>
          </div>
          <a className="scroll-hint" href="#our-goa">
            A little scroll. A lot of possibility.
            <ArrowDown size={17} />
          </a>
        </section>
        <section
          className="places"
          id="our-goa"
          aria-label="For every corner of Goa"
        >
          <p>For the Goa we call home.</p>
          <div className="place-strip">
            <span>Panaji</span>
            <span>Mapusa</span>
            <span>Margao</span>
            <span>Vasco</span>
            <span>Ponda</span>
            <span>Canacona</span>
          </div>
        </section>
        <section className="connection" aria-label="From caring to action">
          <div className="connection-stage">
            <div className="connection-copy">
              <h2>
                Good things happen
                <br />
                when people <span className="green-text">care.</span>
              </h2>
              <p>
                A place to notice, connect, and take action.
                <br />
                All right here, in Goa.
              </p>
            </div>
            <div className="travelling-charms">
              {features.map((feature, i) => (
                <Charm
                  key={feature.name}
                  icon={feature.icon}
                  tone={["green", "silver", "coral", "lime"][i]}
                  className="travel-charm"
                />
              ))}
            </div>
            <div className="connection-product" id="explore">
              <ProductDemo />
            </div>
          </div>
        </section>
        <section className="split-section" id="document">
          <div className="split-copy">
            <h2 className="reveal-heading">
              {heading("See something? Do something.")}
            </h2>
            <p>
              A broken streetlight. A pile of waste. A road that needs
              attention. Give it a photo, a location, and a voice.
            </p>
            <p className="quiet-copy">
              Your report is reviewed before it goes public. You choose how
              precisely to share the location.
            </p>
            <a className="text-action" href="#explore">
              Take a look around <ArrowUpRight size={22} />
            </a>
          </div>
          <div className="panel-stage report-stage">
            <ReportDemo />
          </div>
        </section>
        <section className="split-section split-reverse" id="meetups">
          <div className="panel-stage meetup-stage">
            <MeetupDemo />
          </div>
          <div className="split-copy">
            <h2 className="reveal-heading">
              {heading("Your neighbourhood. Your people.")}
            </h2>
            <p>
              Turn “someone should” into “let’s do this.” Join a cleanup, start
              a walk, or bring your neighbours together.
            </p>
            <p className="quiet-copy">
              Make a meetup, make it yours, and share the invitation. A small
              start is still a start.
            </p>
            <a className="text-action" href="#ways">
              Find your way in <ArrowUpRight size={22} />
            </a>
          </div>
        </section>
        <section
          className="journey"
          aria-label="How local action comes together"
        >
          <div className="journey-stage">
            <div className="journey-track">
              <div className="journey-intro">
                <h2>
                  From a little
                  <br />
                  “what if”
                  <br />
                  to a <span className="green-text">let’s go.</span>
                </h2>
                <p>Good intentions deserve a next step.</p>
                <ArrowRight size={42} strokeWidth={1.25} aria-hidden="true" />
              </div>
              <article className="journey-card journey-notice">
                <div className="journey-picture">
                  <img
                    src={assets + "vagator.webp"}
                    alt="Palms and the coast at Vagator"
                    loading="lazy"
                  />
                  <span className="picture-label">
                    <MapPin size={17} /> Notice what matters
                  </span>
                </div>
                <h3>Start where you are.</h3>
                <p>
                  The beach you walk. The road you take. The corner you call
                  home.
                </p>
              </article>
              <article className="journey-card journey-gather">
                <div className="journey-picture">
                  <img
                    src={assets + "arambol.webp"}
                    alt="People gathering at the Arambol Festival"
                    loading="lazy"
                  />
                  <span className="picture-label">
                    <Users size={17} /> Find your people
                  </span>
                </div>
                <h3>A little company goes far.</h3>
                <p>
                  Bring your neighbours, your friends, and a willingness to lend
                  a hand.
                </p>
              </article>
              <article className="journey-card journey-act">
                <div className="journey-picture">
                  <img
                    src={assets + "cleanup.webp"}
                    alt="Volunteers at a beach cleanup in Candolim, from the ActForGoa archive"
                    loading="lazy"
                  />
                  <span className="picture-label">
                    <Heart size={17} /> Make it a good day
                  </span>
                </div>
                <h3>Care becomes action.</h3>
                <p>A shared place. A shared effort. A reason to come back.</p>
              </article>
            </div>
          </div>
        </section>
        <section className="feature-overview">
          <div className="section-heading">
            <h2>
              One app.
              <br />
              So many ways to care.
            </h2>
            <a className="text-action" href="#explore">
              Explore Go4Goa <ArrowUpRight size={22} />
            </a>
          </div>
          <div className="feature-grid">
            {features.map((f, i) => (
              <a
                className="feature-item"
                href={["#explore", "#document", "#meetups", "#resources"][i]}
                key={f.name}
              >
                <div className={`feature-visual feature-visual-${i}`}>
                  <f.icon size={76} strokeWidth={1.05} />
                  <span className="feature-orbit">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
                <h3>{f.name}</h3>
                <p>{f.description}</p>
              </a>
            ))}
          </div>
        </section>
        <section className="ways split-section" id="ways">
          <div className="ways-preview" aria-live="polite">
            {accordion === 0 ? (
              <MapDemo />
            ) : accordion === 1 ? (
              <MeetupDemo compact />
            ) : (
              <ResourceDemo />
            )}
          </div>
          <div className="ways-copy">
            <h2>
              There’s a way in
              <br />
              for everyone.
            </h2>
            <div className="ways-accordion">
              {[
                [
                  "Notice",
                  "Make everyday issues visible. A useful report starts with a photo and a little context.",
                ],
                [
                  "Connect",
                  "Find a local meetup or make your own. Good company turns a plan into a morning well spent.",
                ],
                [
                  "Act",
                  "Find practical resources, contacts and guidance to help you decide what to do next.",
                ],
              ].map(([name, description], i) => (
                <div
                  className={`way ${accordion === i ? "active" : ""}`}
                  key={name}
                >
                  <h3>
                    <button
                      onClick={() => setAccordion(i)}
                      aria-expanded={accordion === i}
                      aria-controls={`way-${i}`}
                    >
                      {name}
                      <ArrowUpRight size={30} />
                    </button>
                  </h3>
                  <div id={`way-${i}`} hidden={accordion !== i}>
                    <p>{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="community-gallery">
          <div className="gallery-heading">
            <h2 className="reveal-heading">
              {heading("A place worth showing up for.")}
            </h2>
            <p>Our coast. Our streets. Our communities. Our Goa.</p>
          </div>
          <div className="gallery-track" ref={gallery}>
            {[
              {
                img: "vagator.webp",
                title: "For our coast",
                sub: "Vagator, Goa",
                alt: "Palms above the rocky coast at Vagator",
              },
              {
                img: "arambol.webp",
                title: "For our communities",
                sub: "Arambol Festival · archive",
                alt: "Community dancers at the Arambol Festival",
              },
              {
                img: "cleanup.webp",
                title: "For a cleaner tomorrow",
                sub: "Candolim cleanup · archive",
                alt: "Volunteers standing together after a Candolim beach cleanup",
              },
              {
                img: "river.webp",
                title: "For the places between",
                sub: "Goa · ActForGoa archive",
                alt: "A river landscape in Goa",
              },
            ].map((x) => (
              <article className="gallery-card" key={x.img}>
                <img src={assets + x.img} alt={x.alt} loading="lazy" />
                <h3>{x.title}</h3>
                <p>{x.sub}</p>
              </article>
            ))}
          </div>
          <div className="gallery-controls">
            <p>Goa moments from the ActForGoa collection.</p>
            <div>
              <button
                aria-label="Previous Goa photographs"
                onClick={() =>
                  gallery.current?.scrollBy({
                    left: -420,
                    behavior: reduced ? "instant" : "smooth",
                  })
                }
              >
                <ArrowLeft size={22} />
              </button>
              <button
                aria-label="Next Goa photographs"
                onClick={() =>
                  gallery.current?.scrollBy({
                    left: 420,
                    behavior: reduced ? "instant" : "smooth",
                  })
                }
              >
                <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </section>
        <section className="wide-photo">
          <img
            src={assets + "vagator.webp"}
            alt="Sunlight and sea through coconut palms on the Goan coast"
            loading="lazy"
          />
          <div>
            <h2>
              A little action.
              <br />A better Goa.
            </h2>
            <Action href="#explore" light>
              Find your next step
            </Action>
          </div>
          <a
            className="photo-credit"
            href="https://commons.wikimedia.org/wiki/File:Vagator,_Goa,_India,_Palms.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Vagator · Vyacheslav Argenberg · CC BY 4.0
          </a>
        </section>
        <section className="trust-grid" id="resources">
          <article>
            <ShieldCheck size={46} strokeWidth={1.2} />
            <h2>
              Public action.
              <br />
              Personal privacy.
            </h2>
            <p>
              Your phone number stays private. Your public identity is a
              username. Share a precise or approximate report location, with
              moderation before publication.
            </p>
            <a className="text-action" href="#questions">
              How it works <ArrowUpRight size={21} />
            </a>
          </article>
          <article>
            <BookOpen size={46} strokeWidth={1.2} />
            <h2>
              A useful answer.
              <br />A clearer next step.
            </h2>
            <p>
              Practical waste and infrastructure resources, connected to
              ActForGoa. Find the guidance and contacts that help you move
              forward.
            </p>
            <a
              className="text-action"
              href="https://actforgoa.org"
              target="_blank"
              rel="noreferrer"
            >
              Explore ActForGoa <ArrowUpRight size={21} />
            </a>
          </article>
        </section>
        <section className="faq-section" id="questions">
          <h2>
            A few good
            <br />
            questions.
          </h2>
          <div className="faq-list">
            {faq.map(([q, a], i) => (
              <div className="faq-item" key={q}>
                <h3>
                  <button
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {q}
                    {openFaq === i ? <Minus size={21} /> : <Plus size={21} />}
                  </button>
                </h3>
                <div id={`faq-${i}`} hidden={openFaq !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="closing">
          <Charm icon={Heart} tone="coral" />
          <h2>
            This is our Goa.
            <br />
            Let’s care for it.
          </h2>
          <Action />
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <p>
            Small actions.
            <br />
            Shared possibilities.
          </p>
          <nav aria-label="Footer navigation">
            <a href={appUrl}>Explore the app</a>
            <a href="#document">Document an issue</a>
            <a href="#meetups">Find your people</a>
            <a href="#resources">Useful resources</a>
          </nav>
          <div className="footer-detail">
            <span>Made for Goa.</span>
            <span>Interactive homepage · 2026</span>
            <a href="/credits.html">
              Image credits & demo details <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
        <a
          className="footer-brand"
          href="#top"
          aria-label="Go4Goa, back to top"
        >
          <Brand large />
        </a>
        <div className="footer-bottom">
          <span>A place for people who care.</span>
          <span>Inspired by Goa. Built for together.</span>
        </div>
      </footer>
      <button
        className="motion-toggle"
        aria-label={
          systemReduced
            ? "Reduced motion follows your device preference"
            : reduced
              ? "Enable page motion"
              : "Pause page motion"
        }
        aria-pressed={reduced}
        disabled={systemReduced}
        onClick={() => setPaused(!paused)}
      >
        {reduced ? <Play size={14} /> : <Pause size={14} />}
        <span>{reduced ? "Motion off" : "Motion on"}</span>
      </button>
    </div>
  );
}
