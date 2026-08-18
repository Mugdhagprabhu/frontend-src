/** Clinical Cartography: high-contrast dark dashboard prioritizing availability and real-time operational signals. */

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import anime from "animejs";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  CircleAlert,
  Network,
  X,
} from "lucide-react";

import {
  PageHeader,
  SectionHeading,
  StatusBadge,
} from "@/components/OperationalPrimitives";

import {
  InlineError,
  PanelSkeleton,
} from "@/components/OperationalStates";

import {
  apiConfigLabel,
  isDemoMode,
} from "@/services/api";

import {
  dashboardSnapshot,
} from "@/services/mockData";

import {
  useOperationData,
} from "@/hooks/useOperationData";

const SupplyChainScene = lazy(
  () => import("@/components/SupplyChainScene")
);


/* ============================================================================
   ANIMATED NUMBER
============================================================================ */

function AnimatedNumber({
  value,
  suffix,
}: {
  value: number;
  suffix?: string;
}) {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const counterObj = { val: 0 };
    const isInt = Number.isInteger(value);

    const animation = anime({
      targets: counterObj,
      val: value,
      round: isInt ? 1 : 10,
      duration: 750,
      easing: "easeOutCubic",

      update: () => {
        if (spanRef.current) {
          spanRef.current.innerText =
            `${isInt
              ? Math.round(counterObj.val)
              : counterObj.val.toFixed(1)
            }${suffix ?? ""}`;
        }
      },
    });

    return () => {
      animation.pause();
    };
  }, [value, suffix]);

  return (
    <span ref={spanRef} className="data-number">
      {Number.isInteger(value)
        ? value
        : value.toFixed(1)}
      {suffix}
    </span>
  );
}


/* ============================================================================
   3D CONSUMPTION DIAGRAM
============================================================================ */

function Consumption3DScene({
  data,
}: {
  data: Array<{
    day: string;
    observed: number;
    forecast: number;
  }>;
}) {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sceneRef.current || !data.length) return;

    const scene = sceneRef.current;

    const pillars =
      scene.querySelectorAll(".consumption-3d-pillar");

    const labels =
      scene.querySelectorAll(".consumption-3d-label");

    const targets =
      scene.querySelectorAll(".consumption-3d-target");

    /* ----------------------------------------------------------
       PILLAR ENTRANCE
    ---------------------------------------------------------- */

    anime({
      targets: pillars,
      opacity: [0, 1],
      translateY: [55, 0],
      scale: [0.72, 1],
      rotateX: [12, 0],
      delay: anime.stagger(90),
      duration: 850,
      easing: "easeOutBack",
    });


    /* ----------------------------------------------------------
       LABEL ENTRANCE
    ---------------------------------------------------------- */

    anime({
      targets: labels,
      opacity: [0, 1],
      translateY: [12, 0],
      delay: anime.stagger(90, {
        start: 400,
      }),
      duration: 550,
      easing: "easeOutCubic",
    });


    /* ----------------------------------------------------------
       BASELINE TARGET ANIMATION
    ---------------------------------------------------------- */

    anime({
      targets: targets,
      opacity: [0, 1],
      scale: [0.4, 1],
      delay: anime.stagger(90, {
        start: 600,
      }),
      duration: 650,
      easing: "easeOutBack",
    });


    /* ----------------------------------------------------------
       SUBTLE FLOATING EFFECT
    ---------------------------------------------------------- */

    const floatingAnimation = anime({
      targets: pillars,

      translateY: [
        {
          value: -4,
          duration: 1800,
        },
        {
          value: 0,
          duration: 1800,
        },
      ],

      delay: anime.stagger(120),

      loop: true,

      easing: "easeInOutSine",
    });


    return () => {
      floatingAnimation.pause();
    };

  }, [data]);


  const maxValue = Math.max(
    ...data.flatMap((item) => [
      item.observed,
      item.forecast,
    ]),
    1
  );


  return (
    <div
      ref={sceneRef}
      className="relative h-full w-full overflow-hidden rounded-lg"
      style={{
        perspective: "1200px",
      }}
    >

      <style>{`

        /* ==========================================================
           3D FLOOR
        ========================================================== */

        .consumption-3d-floor {
          position: absolute;
          left: 4%;
          right: 4%;
          bottom: 28px;
          height: 72px;

          border: 1px solid rgba(34,60,71,.9);

          background:
            linear-gradient(
              135deg,
              rgba(0,240,160,.045) 25%,
              transparent 25%
            ) 0 0 / 22px 22px,

            linear-gradient(
              315deg,
              rgba(56,189,248,.035) 25%,
              transparent 25%
            ) 0 0 / 22px 22px,

            rgba(7,19,24,.72);

          transform:
            perspective(500px)
            rotateX(60deg);

          transform-origin: bottom;

          box-shadow:
            0 -18px 45px rgba(0,240,160,.04),
            inset 0 0 30px rgba(0,0,0,.45);
        }


        /* ==========================================================
           GRID LIGHT
        ========================================================== */

        .consumption-3d-grid {
          position: absolute;

          left: 5%;
          right: 5%;

          bottom: 58px;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(0,240,160,.42),
              transparent
            );
        }


        .consumption-3d-grid::before {
          content: "";

          position: absolute;

          left: 50%;
          top: -75px;

          width: 1px;
          height: 150px;

          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(56,189,248,.2),
              transparent
            );

          transform: rotate(90deg);
        }


        /* ==========================================================
           STAGE
        ========================================================== */

        .consumption-3d-stage {

          position: relative;

          z-index: 2;

          display: grid;

          grid-template-columns:
            repeat(
              7,
              minmax(65px,1fr)
            );

          align-items: flex-end;

          gap:
            clamp(
              8px,
              2vw,
              22px
            );

          height:
            calc(
              100% - 100px
            );

          padding:
            22px
            clamp(8px,3vw,28px)
            18px;

          transform-style:
            preserve-3d;
        }


        /* ==========================================================
           ITEM
        ========================================================== */

        .consumption-3d-item {

          position: relative;

          height: 100%;

          min-width: 0;

          display: flex;

          align-items: flex-end;

          justify-content: center;

          transform-style:
            preserve-3d;
        }


        .consumption-3d-hover {

          height: 100%;
          width: 100%;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: flex-end;

          transition:
            filter 180ms ease;
        }


        .consumption-3d-hover:hover {

          filter:
            brightness(1.2)
            drop-shadow(
              0 0 12px
              rgba(0,240,160,.18)
            );
        }


        /* ==========================================================
           PILLAR
        ========================================================== */

        .consumption-3d-pillar {

          position: relative;

          width:
            clamp(
              38px,
              5vw,
              58px
            );

          transform-style:
            preserve-3d;

          opacity: 0;

          transform:
            translateY(55px)
            scale(.72);

          display: flex;

          flex-direction: column;

          justify-content: flex-end;

          flex-shrink: 0;

          transition:
            filter 180ms ease;
        }


        .consumption-3d-hover:hover
        .consumption-3d-pillar {

          filter:
            brightness(1.22)
            drop-shadow(
              0 0 10px
              rgba(0,240,160,.28)
            );
        }


        /* ==========================================================
           TOP FACE
        ========================================================== */

        .consumption-3d-pillar::before {

          content: "";

          position: absolute;

          left: 0;
          top: 0;

          width: 100%;
          height: 12px;

          border:
            1px solid
            rgba(0,240,160,.82);

          background:
            linear-gradient(
              135deg,
              rgba(115,255,215,.9),
              rgba(0,240,160,.32)
            );

          transform:
            translateY(-6px)
            skewX(-38deg);

          transform-origin:
            bottom;

          box-shadow:
            0 0 16px
            rgba(0,240,160,.22);

          z-index: 3;
        }


        /* ==========================================================
           RIGHT 3D FACE
        ========================================================== */

        .consumption-3d-pillar::after {

          content: "";

          position: absolute;

          top: 0;
          right: 0;

          width: 12px;
          height: 100%;

          border-right:
            1px solid
            rgba(0,210,165,.52);

          border-top:
            1px solid
            rgba(0,240,160,.38);

          background:
            linear-gradient(
              180deg,
              rgba(0,240,160,.24),
              rgba(0,240,160,.06)
            );

          transform:
            skewY(-38deg);

          transform-origin:
            left;

          z-index: 2;
        }


        /* ==========================================================
           FRONT FACE
        ========================================================== */

        .consumption-3d-front {

          position: relative;

          width:
            calc(
              100% - 12px
            );

          height: 100%;

          overflow: hidden;

          border:
            1px solid
            rgba(0,240,160,.72);

          background:

            linear-gradient(
              90deg,
              rgba(0,240,160,.16),
              rgba(0,240,160,.3),
              rgba(0,240,160,.12)
            ),

            linear-gradient(
              180deg,
              rgba(18,78,69,.96),
              rgba(8,43,40,.98)
            );

          box-shadow:

            inset 0 0 22px
            rgba(0,240,160,.12),

            0 0 20px
            rgba(0,240,160,.07);

          z-index: 1;
        }


        /* scan lines */

        .consumption-3d-front::after {

          content: "";

          position: absolute;

          inset: 0;

          background:
            repeating-linear-gradient(
              0deg,
              transparent 0,
              transparent 9px,
              rgba(150,255,225,.075) 10px
            );

          pointer-events: none;
        }


        /* ==========================================================
           BASELINE TARGET
        ========================================================== */

        .consumption-3d-target {

          position: absolute;

          left: -9px;
          right: -9px;

          height: 4px;

          border:
            1px solid
            rgba(56,189,248,.85);

          background:
            rgba(56,189,248,.28);

          box-shadow:

            0 0 8px
            rgba(56,189,248,.38),

            0 0 18px
            rgba(56,189,248,.12);

          opacity: 0;

          z-index: 5;
        }


        .consumption-3d-target::before,
        .consumption-3d-target::after {

          content: "";

          position: absolute;

          top: -3px;

          width: 5px;
          height: 8px;

          border:
            1px solid
            #38bdf8;

          background:
            #0d191f;
        }


        .consumption-3d-target::before {
          left: -4px;
        }

        .consumption-3d-target::after {
          right: -4px;
        }


        /* ==========================================================
           LABELS
        ========================================================== */

        .consumption-3d-label {

          margin-top: 10px;

          width: 100%;

          text-align: center;

          white-space: nowrap;

          opacity: 0;

          z-index: 10;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: flex-start;

          flex-shrink: 0;
        }


        .consumption-3d-value {

          font-family:
            ui-monospace,
            SFMono-Regular,
            Menlo,
            Monaco,
            Consolas,
            monospace;

          font-size: 12px;

          line-height: 16px;

          font-weight: 800;

          color: #e7f7f4;

          text-shadow:
            0 1px 8px
            rgba(0,0,0,.8);
        }


        .consumption-3d-day {

          margin-top: 3px;

          font-size: 9px;

          line-height: 12px;

          font-weight: 700;

          letter-spacing: .12em;

          text-transform: uppercase;

          color: #a9c1ca;

          text-shadow:
            0 1px 6px
            rgba(0,0,0,.8);
        }


        /* ==========================================================
           CORNER HUD
        ========================================================== */

        .consumption-3d-corner {

          position: absolute;

          width: 7px;
          height: 7px;

          border-color:
            rgba(0,240,160,.7);

          pointer-events: none;
        }


        .consumption-3d-corner.tl {

          left: 0;
          top: 0;

          border-left: 1px solid;
          border-top: 1px solid;
        }


        .consumption-3d-corner.tr {

          right: 0;
          top: 0;

          border-right: 1px solid;
          border-top: 1px solid;
        }


        .consumption-3d-corner.bl {

          left: 0;
          bottom: 0;

          border-left: 1px solid;
          border-bottom: 1px solid;
        }


        .consumption-3d-corner.br {

          right: 0;
          bottom: 0;

          border-right: 1px solid;
          border-bottom: 1px solid;
        }


        /* ==========================================================
           MOBILE
        ========================================================== */

        @media (max-width: 640px) {

          .consumption-3d-stage {

            gap: 5px;

            padding-left: 4px;
            padding-right: 4px;
          }


          .consumption-3d-pillar {
            width: 30px;
          }


          .consumption-3d-value {
            font-size: 8px;
          }


          .consumption-3d-day {
            font-size: 7px;
          }

        }

      `}</style>


      {/* ==========================================================
          LEGEND
      ========================================================== */}

      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">

        <span
          className="
            inline-flex items-center gap-2
            rounded
            border border-[#1e5344]
            bg-[#0d191f]/90
            px-2.5 py-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-[#00f0a0]
            backdrop-blur-sm
          "
        >

          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-[#00f0a0]
              shadow-[0_0_8px_rgba(0,240,160,.7)]
            "
          />

          Observed volume

        </span>


        <span
          className="
            inline-flex items-center gap-2
            rounded
            border border-[#194d64]
            bg-[#0d191f]/90
            px-2.5 py-1.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-[#38bdf8]
            backdrop-blur-sm
          "
        >

          <span
            className="
              h-px w-3
              border-t-2
              border-[#38bdf8]
            "
          />

          Demand baseline

        </span>

      </div>


      {/* ==========================================================
          3D FLOOR
      ========================================================== */}

      <div className="consumption-3d-floor" />

      <div className="consumption-3d-grid" />


      {/* ==========================================================
          PILLARS
      ========================================================== */}

      <div className="consumption-3d-stage">

        {data.map((item) => {

          const observedHeight =
            Math.max(
              46,
              (item.observed / maxValue) * 175
            );


          const baselinePosition =
            Math.min(
              100,
              Math.max(
                8,
                (item.forecast /
                  Math.max(
                    item.observed,
                    maxValue
                  )) *
                  100
              )
            );


          return (

            <div
              key={item.day}
              className="consumption-3d-item"
            >

              <div className="consumption-3d-hover">

                <div
                  className="consumption-3d-pillar"
                  style={{
                    height:
                      `${observedHeight}px`,
                  }}
                >

                  <div
                    className="consumption-3d-front"
                  >

                    <span className="consumption-3d-corner tl" />
                    <span className="consumption-3d-corner tr" />
                    <span className="consumption-3d-corner bl" />
                    <span className="consumption-3d-corner br" />

                  </div>


                  <div
                    className="consumption-3d-target"
                    style={{
                      bottom:
                        `${baselinePosition}%`,
                    }}
                  />

                </div>


                <div className="consumption-3d-label">

                  <div className="consumption-3d-value">

                    {item.observed.toFixed(1)}k

                  </div>


                  <div className="consumption-3d-day">

                    {item.day}

                  </div>

                </div>

              </div>

            </div>

          );
        })}

      </div>


      {/* ==========================================================
          FOOTER HUD
      ========================================================== */}

      <div
        className="
          absolute
          bottom-2
          left-1/2
          z-10
          -translate-x-1/2
          whitespace-nowrap
          rounded
          border
          border-[#223c47]
          bg-[#0d191f]/90
          px-3
          py-1.5
          text-[9px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-[#9bb3c1]
          backdrop-blur-sm
        "
      >
        7-day operational consumption · thousands of units
      </div>

    </div>
  );
}


/* ============================================================================
   DASHBOARD
============================================================================ */

export default function Dashboard() {

  const [, navigate] = useLocation();

  const {
    data,
    loading,
    error,
    retry,
  } = useOperationData(
    async () => dashboardSnapshot,
    []
  );


  const [networkOpen, setNetworkOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const modalRef =
    useRef<HTMLDivElement | null>(null);


  /* ==========================================================================
     PAGE ANIMATIONS
  ========================================================================== */

  useEffect(() => {

    if (
      loading ||
      !data ||
      !containerRef.current
    ) {
      return;
    }

    const ctx =
      containerRef.current;


    /* KPI CARDS */

    anime({
      targets:
        ctx.querySelectorAll(".kpi-card"),

      translateY: [16, 0],

      scale: [.97, 1],

      opacity: [0, 1],

      delay:
        anime.stagger(60),

      duration: 600,

      easing: "easeOutBack",
    });


    /* SECTIONS */

    anime({
      targets:
        ctx.querySelectorAll(".section-panel"),

      translateY: [18, 0],

      opacity: [0, 1],

      delay:
        anime.stagger(80, {
          start: 200,
        }),

      duration: 600,

      easing: "easeOutQuart",
    });


    /* ALERTS */

    anime({
      targets:
        ctx.querySelectorAll(
          ".alert-item-anim"
        ),

      translateX: [-12, 0],

      opacity: [0, 1],

      delay:
        anime.stagger(70, {
          start: 300,
        }),

      duration: 500,

      easing: "easeOutCubic",
    });


    /* ALERT ICONS */

    anime({
      targets:
        ctx.querySelectorAll(
          ".alert-icon-anim"
        ),

      scale: [.6, 1],

      opacity: [0, 1],

      delay:
        anime.stagger(70, {
          start: 380,
        }),

      duration: 400,

      easing: "easeOutBack",
    });


    /* ACTIVITY */

    anime({
      targets:
        ctx.querySelectorAll(
          ".activity-item-anim"
        ),

      translateX: [12, 0],

      opacity: [0, 1],

      delay:
        anime.stagger(50, {
          start: 350,
        }),

      duration: 450,

      easing: "easeOutCubic",
    });


    /* CRITICAL PULSE */

    const dotPulse = anime({

      targets:
        ctx.querySelectorAll(
          ".pulse-critical"
        ),

      scale: [1, 1.45],

      opacity: [1, .45],

      direction:
        "alternate",

      loop: true,

      easing:
        "easeInOutSine",

      duration: 900,

    });


    return () => {
      dotPulse.pause();
    };

  }, [loading, data]);


  /* ==========================================================================
     MODAL ANIMATION
  ========================================================================== */

  useEffect(() => {

    if (
      networkOpen &&
      modalRef.current
    ) {

      anime({

        targets:
          modalRef.current,

        scale: [.94, 1],

        opacity: [0, 1],

        duration: 350,

        easing:
          "easeOutCubic",

      });

    }

  }, [networkOpen]);


  const closeNetworkModal = () => {

    if (modalRef.current) {

      anime({

        targets:
          modalRef.current,

        scale: [1, .94],

        opacity: [1, 0],

        duration: 200,

        easing:
          "easeInCubic",

        complete: () =>
          setNetworkOpen(false),

      });

    } else {

      setNetworkOpen(false);

    }

  };


  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {

    return (

      <div className="page-enter">

        <PanelSkeleton
          className="mb-5"
          lines={2}
        />

        <div
          className="
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-5
          "
        >

          {Array.from({
            length: 5,
          }).map((_, index) => (

            <PanelSkeleton
              key={index}
              lines={2}
            />

          ))}

        </div>

      </div>

    );
  }


  /* ==========================================================================
     ERROR
  ========================================================================== */

  if (error || !data) {

    return (

      <InlineError
        message={
          error ?? undefined
        }
        retry={retry}
      />

    );
  }


  /* ==========================================================================
     MAIN DASHBOARD
  ========================================================================== */

  return (

    <div
      ref={containerRef}
      className="
        page-enter
        max-w-[1640px]
        text-white
      "
    >

      <style>{`

        .pulse-critical::after {

          content: "";

          position: absolute;

          inset: 0;

          border-radius:
            9999px;

          background:
            inherit;

          animation:
            distrack-pulse-ring
            1.8s ease-out
            infinite;

          pointer-events: none;
        }


        @keyframes distrack-pulse-ring {

          0% {

            opacity: .55;

            transform:
              scale(1);
          }

          100% {

            opacity: 0;

            transform:
              scale(2.6);
          }

        }


        .route-banner-img {

          animation:
            distrack-kenburns
            22s ease-in-out
            infinite alternate;
        }


        @keyframes distrack-kenburns {

          from {
            transform: scale(1);
          }

          to {
            transform: scale(1.08);
          }

        }


        .kpi-card {

          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }


        .kpi-card:hover {

          box-shadow:
            0 10px 24px
            rgba(0,240,160,.12);
        }

      `}</style>


      {/* =========================================================================
          PAGE HEADER
      ========================================================================= */}

      <PageHeader
        eyebrow="National operations"
        title="Operations overview"
        subtitle="Medicine availability and supply activity across the Maharashtra network."
        action={

          <div
            className={`
              inline-flex
              items-center
              gap-2
              rounded
              border
              px-3 py-2
              text-[11px]
              font-bold
              uppercase
              tracking-[0.08em]

              ${
                isDemoMode
                  ? "border-[#1b4356] bg-[#0e2938] text-[#38bdf8]"
                  : "border-[#1e5344] bg-[#12362b] text-[#00f0a0]"
              }
            `}
          >

            <span
              className={`
                h-1.5
                w-1.5
                rounded-full

                ${
                  isDemoMode
                    ? "bg-[#38bdf8]"
                    : "bg-[#00f0a0]"
                }
              `}
            />

            {apiConfigLabel()}

          </div>

        }
      />


      {/* =========================================================================
          KPI SECTION
      ========================================================================= */}

      <section
        className="
          mb-5
          grid
          gap-3
          sm:grid-cols-2
          xl:grid-cols-5
        "
        aria-label="Key performance indicators"
      >

        {data.metrics.map((metric) => (

          <article
            key={metric.label}
            className="
              kpi-card
              surface-panel
              surface-panel-hover
              min-h-[126px]
              p-4
              transition-transform
              duration-200
              hover:-translate-y-0.5
              border
              border-[#223c47]
              bg-[#13242b]
            "
          >

            <p
              className="
                label-kicker
                text-[#00f0a0]
              "
            >
              {metric.label}
            </p>


            <div
              className="
                mt-3
                flex
                items-end
                justify-between
                gap-2
              "
            >

              <p
                className={`
                  data-number
                  text-[28px]
                  font-bold
                  tracking-[-0.045em]

                  ${
                    metric.tone === "critical"
                      ? "text-[#f87171]"
                      : metric.tone === "warning"
                      ? "text-[#fbbf24]"
                      : metric.tone === "healthy"
                      ? "text-[#00f0a0]"
                      : "text-white"
                  }
                `}
              >

                <AnimatedNumber
                  value={metric.value}
                  suffix={metric.suffix}
                />

              </p>


              <span
                className={`
                  relative
                  mb-1
                  h-2
                  w-2
                  rounded-full

                  ${
                    metric.tone === "critical"
                      ? "bg-[#f87171] pulse-critical"
                      : metric.tone === "warning"
                      ? "bg-[#fbbf24]"
                      : metric.tone === "healthy"
                      ? "bg-[#00f0a0]"
                      : "bg-[#38bdf8]"
                  }
                `}
              />

            </div>


            <p
              className="
                mt-2
                border-t
                border-[#223c47]
                pt-2
                text-[11px]
                font-medium
                text-[#cbd5e1]
              "
            >
              {metric.detail}
            </p>

          </article>

        ))}

      </section>


      {/* =========================================================================
          CONSUMPTION + ALERTS
      ========================================================================= */}

      <section
        className="
          grid
          gap-5
          xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]
        "
      >

        {/* =======================================================================
            3D CONSUMPTION PANEL
        ======================================================================= */}

        <article
          className="
            section-panel
            surface-panel
            p-5
            sm:p-6
            border
            border-[#223c47]
            bg-[#13242b]
          "
        >

          <SectionHeading
            label="Consumption signal"
            title="Seven-day medicine consumption"
            detail="Observed volume compared with demand baseline, in thousands of units."
            action={

              <button
                onClick={() =>
                  navigate("/insights")
                }
                className="
                  group
                  hidden
                  items-center
                  gap-1
                  text-xs
                  font-bold
                  text-[#00f0a0]
                  hover:text-[#38bdf8]
                  sm:flex
                "
              >

                View forecast

                <ArrowRight
                  size={14}
                  className="
                    transition-transform
                    duration-150
                    group-hover:translate-x-1
                  "
                />

              </button>

            }
          />


          {/* THE NEW 3D ANIMATION */}

          <div
            className="
              mt-5
              h-[300px]
              sm:h-[330px]
              rounded-lg
              border
              border-[#1c3641]
              bg-[#09151a]
              shadow-[inset_0_0_45px_rgba(0,240,160,.025)]
            "
          >

            <Consumption3DScene
              data={
                data.consumptionTrend
              }
            />

          </div>


          {/* BOTTOM INFO */}

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              border-t
              border-[#223c47]
              pt-3
              text-[11px]
              font-medium
              text-[#cbd5e1]
            "
          >

            <span
              className="
                inline-flex
                items-center
                gap-2
              "
            >

              <i
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-[#00f0a0]
                "
              />

              Observed consumption

            </span>


            <span
              className="
                inline-flex
                items-center
                gap-2
              "
            >

              <i
                className="
                  h-px
                  w-3
                  border-t-2
                  border-dashed
                  border-[#38bdf8]
                "
              />

              Demand baseline

            </span>


            <span
              className="
                ml-auto
                text-[#9bb3c1]
              "
            >
              Daily refresh · 06:00 IST
            </span>

          </div>

        </article>


        {/* =======================================================================
            ALERTS
        ======================================================================= */}

        <article
          className="
            section-panel
            surface-panel
            overflow-hidden
            border
            border-[#223c47]
            bg-[#13242b]
          "
        >

          <div
            className="
              border-b
              border-[#223c47]
              p-5
              sm:p-6
            "
          >

            <SectionHeading
              label="Attention queue"
              title="Operational alerts"
              detail="Items needing action or verification."
              action={

                <button
                  onClick={() =>
                    navigate("/alerts")
                  }
                  className="
                    text-xs
                    font-bold
                    text-[#00f0a0]
                    hover:text-[#38bdf8]
                  "
                >
                  View all
                </button>

              }
            />

          </div>


          <div>

            {data.operationalAlerts.map(
              (alert, index) => (

                <button
                  key={alert.id}
                  onClick={() =>
                    navigate(
                      alert.id ===
                        "alert-shipment"
                        ? "/shipments"
                        : alert.id ===
                          "alert-para"
                        ? "/inventory"
                        : "/alerts"
                    )
                  }
                  className={`
                    alert-item-anim
                    group
                    w-full
                    px-5
                    py-4
                    text-left
                    transition-colors
                    duration-150
                    hover:bg-[#1a323c]
                    sm:px-6

                    ${
                      index > 0
                        ? "border-t border-[#223c47]"
                        : ""
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >

                    <span
                      className={`
                        alert-icon-anim
                        mt-0.5
                        grid
                        h-7
                        w-7
                        shrink-0
                        place-items-center
                        rounded
                        border
                        transition-transform
                        duration-150
                        group-hover:scale-105

                        ${
                          alert.severity ===
                          "critical"
                            ? "border-[#622323] bg-[#3a1515] text-[#f87171]"
                            : "border-[#5c4217] bg-[#38260a] text-[#fbbf24]"
                        }
                      `}
                    >

                      <CircleAlert
                        size={15}
                      />

                    </span>


                    <span
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <span
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        "
                      >

                        <StatusBadge
                          status={
                            alert.severity
                          }
                          label={
                            alert.severity ===
                            "critical"
                              ? "Critical"
                              : "Warning"
                          }
                        />

                        <span
                          className="
                            text-[12px]
                            font-bold
                            text-white
                          "
                        >
                          {alert.drug}
                        </span>

                      </span>


                      <span
                        className="
                          mt-1.5
                          block
                          text-[11px]
                          font-medium
                          text-[#cbd5e1]
                        "
                      >
                        {alert.facility}
                      </span>


                      <span
                        className="
                          mt-1
                          block
                          text-xs
                          text-[#9bb3c1]
                        "
                      >
                        {alert.message}
                      </span>


                      <span
                        className="
                          mt-2
                          inline-flex
                          items-center
                          gap-1
                          text-[11px]
                          font-bold
                          text-[#00f0a0]
                          group-hover:text-[#38bdf8]
                        "
                      >

                        {alert.action}

                        <ChevronRight
                          size={13}
                          className="
                            transition-transform
                            duration-150
                            group-hover:translate-x-1
                          "
                        />

                      </span>

                    </span>

                  </div>

                </button>

              )
            )}

          </div>


          <button
            onClick={() =>
              navigate("/alerts")
            }
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              border-t
              border-[#223c47]
              bg-[#0d191f]
              py-3
              text-xs
              font-bold
              text-[#00f0a0]
              transition-colors
              duration-150
              hover:bg-[#16272e]
            "
          >

            <Activity size={14} />

            Open alert worklist

          </button>

        </article>

      </section>


      {/* =========================================================================
          SHIPMENT + RECOMMENDATION
      ========================================================================= */}

      <section
        className="
          mt-5
          grid
          gap-5
          xl:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]
        "
      >

        {/* SHIPMENT */}

        <article
          className="
            section-panel
            relative
            min-h-[270px]
            overflow-hidden
            rounded-[10px]
            border
            border-[#223c47]
            bg-[#11232b]
            p-5
            text-white
            sm:p-6
          "
        >

          <img
            src="/manus-storage/distrack-shipment-route_53ac9077.jpg"
            alt="Medicine shipment route between distribution facility and district hospital"
            className="
              route-banner-img
              absolute
              inset-0
              h-full
              w-full
              object-cover
              opacity-60
            "
          />


          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-[#071318]/95
              via-[#071318]/80
              to-[#071318]/25
            "
          />


          <div
            className="
              relative
              flex
              h-full
              flex-col
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-[#00f0a0]
                  "
                >
                  Route in focus
                </p>


                <h2
                  className="
                    mt-2
                    text-xl
                    font-bold
                    tracking-[-0.025em]
                    text-white
                  "
                >
                  Ceftriaxone delivery is in transit
                </h2>

              </div>


              <StatusBadge
                status="warning"
                label="6h delayed"
                className="
                  border-[#5c4217]
                  bg-[#38260a]
                  text-[#fbbf24]
                "
              />

            </div>


            <p
              className="
                mt-3
                max-w-md
                text-sm
                leading-6
                text-[#cbd5e1]
              "
            >
              SH-MH-20476 is carrying 1,200 vials from the state warehouse to Nashik District Hospital.
            </p>


            <div
              className="
                mt-auto
                flex
                flex-wrap
                items-center
                gap-x-6
                gap-y-2
                border-t
                border-[#223c47]
                pt-4
                text-[11px]
                font-medium
                text-slate-200
              "
            >

              <span>

                <span className="text-[#00f0a0] font-semibold">
                  Current location
                </span>

                <br />

                <span className="text-white">
                  Kasara Ghat checkpoint
                </span>

              </span>


              <span>

                <span className="text-[#00f0a0] font-semibold">
                  Revised ETA
                </span>

                <br />

                <span className="text-white">
                  Today, 18:30
                </span>

              </span>


              <button
                onClick={() =>
                  navigate("/shipments")
                }
                className="
                  group
                  ml-auto
                  inline-flex
                  h-9
                  items-center
                  gap-2
                  rounded
                  border
                  border-[#223c47]
                  bg-[#13242b]/80
                  px-3
                  text-xs
                  font-bold
                  text-white
                  transition-all
                  duration-150
                  hover:border-[#00f0a0]
                  hover:bg-[#1a323c]
                "
              >

                Track shipment

                <ArrowRight
                  size={14}
                  className="
                    transition-transform
                    duration-150
                    group-hover:translate-x-1
                  "
                />

              </button>

            </div>

          </div>

        </article>


        {/* RECOMMENDATION */}

        <article
          className="
            section-panel
            surface-panel
            relative
            overflow-hidden
            p-5
            sm:p-6
            border
            border-[#223c47]
            bg-[#13242b]
          "
        >

          <img
            src="/manus-storage/distrack-analytics-texture_c2d2cd15.jpg"
            alt=""
            className="
              pointer-events-none
              absolute
              inset-0
              h-full
              w-full
              object-cover
              opacity-[0.08]
            "
          />


          <div className="relative">

            <SectionHeading
              label="Decision support"
              title="Redistribution action recommended"
              detail="Highest confidence operational recommendation."
            />


            <div
              className="
                mt-5
                flex
                items-start
                justify-between
                gap-5
              "
            >

              <div>

                <p
                  className="
                    text-[13px]
                    font-bold
                    text-white
                  "
                >
                  Insulin Glargine
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-[#cbd5e1]
                  "
                >
                  Mumbai District Hospital
                </p>

              </div>


              <div className="text-right">

                <p
                  className="
                    data-number
                    text-2xl
                    font-bold
                    tracking-[-0.04em]
                    text-[#00f0a0]
                  "
                >
                  92%
                </p>

                <p
                  className="
                    label-kicker
                    mt-1
                    text-[#9bb3c1]
                  "
                >
                  Confidence
                </p>

              </div>

            </div>


            <p
              className="
                mt-4
                border-l-2
                border-[#00f0a0]
                pl-3
                text-[13px]
                leading-5
                text-[#cbd5e1]
              "
            >
              Transfer 320 pens from Pune Regional Medical Center to protect four days of projected service.
            </p>


            <button
              onClick={() =>
                navigate("/insights")
              }
              className="
                group
                mt-5
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                text-[#00f0a0]
                hover:text-[#38bdf8]
              "
            >

              Review recommendation

              <ArrowRight
                size={14}
                className="
                  transition-transform
                  duration-150
                  group-hover:translate-x-1
                "
              />

            </button>

          </div>

        </article>

      </section>


      {/* =========================================================================
          NETWORK + ACTIVITY
      ========================================================================= */}

      <section
        className="
          mt-5
          grid
          gap-5
          xl:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]
        "
      >

        {/* NETWORK */}

        <article
          className="
            section-panel
            surface-panel
            overflow-hidden
            border
            border-[#223c47]
            bg-[#13242b]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-[#223c47]
              p-5
              sm:p-6
            "
          >

            <div>

              <p
                className="
                  label-kicker
                  text-[#00f0a0]
                "
              >
                Network visibility
              </p>

              <h2
                className="
                  mt-1.5
                  text-[15px]
                  font-bold
                  text-white
                "
              >
                Maharashtra supply network
              </h2>

            </div>


            <button
              onClick={() =>
                setNetworkOpen(true)
              }
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-md
                border
                border-[#223c47]
                bg-[#0d191f]
                px-3
                text-xs
                font-bold
                text-[#00f0a0]
                transition-colors
                duration-150
                hover:border-[#00f0a0]
                hover:bg-[#1a323c]
              "
            >

              <Network size={15} />

              Explore network

            </button>

          </div>


          <div
            className="
              relative
              min-h-[190px]
              overflow-hidden
            "
          >

            <img
              src="/manus-storage/distrack-national-network_c8046537.jpg"
              alt="Abstract regional medicine supply network map"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                opacity-35
              "
            />


            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-[#0d191f]/95
                via-[#0d191f]/80
                to-transparent
              "
            />


            <div
              className="
                relative
                max-w-[370px]
                p-5
                sm:p-6
              "
            >

              <p
                className="
                  text-[13px]
                  font-bold
                  text-white
                "
              >
                118 facilities are currently within threshold.
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-[#cbd5e1]
                "
              >
                Three facilities require direct coordination. Route activity is concentrated between Mumbai, Nashik, and Pune this afternoon.
              </p>


              <div
                className="
                  mt-5
                  flex
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-[#1e353f]
                "
              >

                {data.availability.states.map(
                  (state) => (

                    <span
                      key={state.label}
                      style={{
                        width:
                          `${(state.value / 126) * 100}%`,
                        backgroundColor:
                          state.color,
                      }}
                    />

                  )
                )}

              </div>


              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-x-3
                  gap-y-1
                  text-[10px]
                  font-semibold
                  text-[#9bb3c1]
                "
              >

                {data.availability.states.map(
                  (state) => (

                    <span key={state.label}>

                      {state.value}{" "}
                      {state.label.toLowerCase()}

                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        </article>


        {/* ACTIVITY */}

        <article
          className="
            section-panel
            surface-panel
            overflow-hidden
            border
            border-[#223c47]
            bg-[#13242b]
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-[#223c47]
              p-5
              sm:p-6
            "
          >

            <div>

              <p
                className="
                  label-kicker
                  text-[#00f0a0]
                "
              >
                Live ledger
              </p>

              <h2
                className="
                  mt-1.5
                  text-[15px]
                  font-bold
                  text-white
                "
              >
                Network activity
              </h2>

            </div>


            <button
              onClick={() =>
                navigate("/audit")
              }
              className="
                text-xs
                font-bold
                text-[#00f0a0]
                hover:text-[#38bdf8]
              "
            >
              Audit trail
            </button>

          </div>


          <div>

            {data.activity.map(
              (item, index) => (

                <div
                  key={`${item.time}-${item.action}`}
                  className={`
                    activity-item-anim
                    flex
                    gap-3
                    px-5
                    py-3.5
                    transition-colors
                    duration-150
                    hover:bg-[#1a323c]
                    sm:px-6

                    ${
                      index
                        ? "border-t border-[#223c47]"
                        : ""
                    }
                  `}
                >

                  <span
                    className={`
                      mt-1
                      h-2
                      w-2
                      shrink-0
                      rounded-full

                      ${
                        item.kind === "alert"
                          ? "bg-[#f87171]"
                          : item.kind === "receipt"
                          ? "bg-[#00f0a0]"
                          : item.kind === "transfer"
                          ? "bg-[#38bdf8]"
                          : "bg-[#00f0a0]"
                      }
                    `}
                  />


                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <div
                      className="
                        flex
                        items-baseline
                        justify-between
                        gap-3
                      "
                    >

                      <p
                        className="
                          text-[12px]
                          font-bold
                          text-white
                        "
                      >
                        {item.action}
                      </p>


                      <time
                        className="
                          data-number
                          whitespace-nowrap
                          text-[10px]
                          font-medium
                          text-[#9bb3c1]
                        "
                      >
                        {item.time}
                      </time>

                    </div>


                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-4
                        text-[#cbd5e1]
                      "
                    >
                      {item.detail}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </article>

      </section>


      {/* =========================================================================
          NETWORK MODAL
      ========================================================================= */}

      {networkOpen && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-[#050c0f]/80
            p-3
            backdrop-blur-[2px]
            sm:p-8
          "
        >

          <div
            ref={modalRef}
            className="
              mx-auto
              flex
              h-full
              max-w-6xl
              flex-col
              overflow-auto
              rounded-xl
              border
              border-[#223c47]
              bg-[#13242b]
              shadow-2xl
            "
          >

            <header
              className="
                flex
                items-start
                justify-between
                border-b
                border-[#223c47]
                bg-[#0d191f]
                px-5
                py-5
                sm:px-7
              "
            >

              <div>

                <p
                  className="
                    label-kicker
                    text-[#00f0a0]
                  "
                >
                  Interactive visualization
                </p>


                <h2
                  className="
                    mt-2
                    text-xl
                    font-bold
                    tracking-[-0.025em]
                    text-white
                  "
                >
                  State to facility supply network
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-[#cbd5e1]
                  "
                >
                  Select a facility node to review its current availability and shortage exposure.
                </p>

              </div>


              <button
                onClick={
                  closeNetworkModal
                }
                aria-label="Close network visualization"
                className="
                  grid
                  h-9
                  w-9
                  place-items-center
                  rounded-md
                  border
                  border-[#223c47]
                  bg-[#13242b]
                  text-[#9bb3c1]
                  transition-colors
                  duration-150
                  hover:border-[#00f0a0]
                  hover:text-white
                "
              >

                <X size={18} />

              </button>

            </header>


            <div
              className="
                flex-1
                p-4
                sm:p-7
              "
            >

              <Suspense
                fallback={
                  <PanelSkeleton
                    className="h-full"
                    lines={5}
                  />
                }
              >

                <SupplyChainScene />

              </Suspense>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
