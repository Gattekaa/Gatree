'use client'
import { cn } from "@/lib/utils";
import type React from "react";

export default function LavaBackground(): React.ReactNode {
  const items = [
    {
      size: 72,
      color: "rgb(12, 245, 167)",
      x: 444,
      y: 622,
      floatTo: "floatDown"
    },
    {
      size: 463,
      color: "rgb(93, 2, 248)",
      x: 1306,
      y: 516,
      floatTo: "floatUp"
    },
    {
      size: 501,
      color: "rgb(62, 72, 31)",
      x: 372,
      y: 441,
      floatTo: "floatUp"
    },
    {
      size: 122,
      color: "rgb(122, 97, 172)",
      x: 474,
      y: 318,
      floatTo: "floatUp"
    },
    {
      size: 102,
      color: "rgb(51, 168, 219)",
      x: 1004,
      y: 736,
      floatTo: "floatUp"
    },
    {
      size: 537,
      color: "rgb(85, 153, 240)",
      x: 1073,
      y: 184,
      floatTo: "floatUp"
    },
    {
      size: 451,
      color: "rgb(96, 31, 128)",
      x: 599,
      y: 116,
      floatTo: "floatUp"
    },
    {
      size: 250,
      color: "rgb(47, 185, 198)",
      x: 438,
      y: 384,
      floatTo: "floatDown"
    },
    {
      size: 301,
      color: "rgb(186, 63, 20)",
      x: 462,
      y: 110,
      floatTo: "floatUp"
    },
    {
      size: 237,
      color: "rgb(158, 33, 233)",
      x: 887,
      y: 450,
      floatTo: "floatDown"
    },
    {
      size: 327,
      color: "rgb(236, 96, 164)",
      x: 598,
      y: 479,
      floatTo: "floatUp"
    },
    {
      size: 369,
      color: "rgb(180, 131, 196)",
      x: 1697,
      y: 386,
      floatTo: "floatUp"
    },
    {
      size: 249,
      color: "rgb(202, 144, 64)",
      x: 1244,
      y: 782,
      floatTo: "floatDown"
    },
    {
      size: 323,
      color: "rgb(32, 244, 186)",
      x: 450,
      y: 905,
      floatTo: "floatUp"
    },
    {
      size: 255,
      color: "rgb(3, 71, 151)",
      x: 1444,
      y: 526,
      floatTo: "floatDown"
    },
    {
      size: 112,
      color: "rgb(237, 20, 3)",
      x: 915,
      y: 581,
      floatTo: "floatUp"
    },
    {
      size: 378,
      color: "rgb(46, 8, 212)",
      x: 159,
      y: 329,
      floatTo: "floatUp"
    },
    {
      size: 73,
      color: "rgb(67, 177, 43)",
      x: 1142,
      y: 228,
      floatTo: "floatUp"
    },
    {
      size: 489,
      color: "rgb(103, 251, 99)",
      x: 1895,
      y: 107,
      floatTo: "floatUp"
    },
    {
      size: 492,
      color: "rgb(187, 95, 60)",
      x: 1828,
      y: 687,
      floatTo: "floatDown"
    },
    {
      size: 361,
      color: "rgb(204, 189, 116)",
      x: 1705,
      y: 804,
      floatTo: "floatDown"
    },
    {
      size: 122,
      color: "rgb(246, 92, 55)",
      x: 882,
      y: 497,
      floatTo: "floatDown"
    },
    {
      size: 436,
      color: "rgb(89, 63, 123)",
      x: 7,
      y: 3,
      floatTo: "floatUp"
    },
    {
      size: 172,
      color: "rgb(254, 197, 236)",
      x: 1864,
      y: 543,
      floatTo: "floatDown"
    },
    {
      size: 362,
      color: "rgb(159, 195, 67)",
      x: 189,
      y: 52,
      floatTo: "floatUp"
    },
    {
      size: 421,
      color: "rgb(95, 68, 215)",
      x: 789,
      y: 611,
      floatTo: "floatDown"
    },
    {
      size: 341,
      color: "rgb(76, 250, 83)",
      x: 1845,
      y: 986,
      floatTo: "floatUp"
    },
    {
      size: 392,
      color: "rgb(11, 163, 125)",
      x: 1538,
      y: 742,
      floatTo: "floatUp"
    },
    {
      size: 228,
      color: "rgb(254, 63, 254)",
      x: 1003,
      y: 91,
      floatTo: "floatDown"
    },
    {
      size: 148,
      color: "rgb(173, 197, 97)",
      x: 1757,
      y: 335,
      floatTo: "floatDown"
    }
  ]

  return items.map((item, idx) => (
    <div
      key={idx}
      className={cn(
        "fixed w-1 h-1 rounded-full blur-[100px] brightness-[.9",
        item.floatTo === "floatDown" ? "animate-floatDown" : "animate-floatUp"
      )}
      style={{
        width: item.size,
        height: item.size,
        background: `radial-gradient(${item.color}, transparent)`,
        top: item.y,
        left: item.x,
      }}
    />
  ))
}