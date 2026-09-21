---
title: "ThorVG v1.1 - Rising the Standard"
date: 2026-07-23
tags: Release
writer: Hermet Park
---

# Overview

Following the major architectural milestone of ThorVG v1.0, this release focuses on refining the engine for real-world production use. ThorVG v1.1 delivers significant improvements in rendering performance, standards compliance, platform integration, and developer experience—making the engine faster, more compatible, and easier to integrate across diverse environments.

This release introduces substantial optimizations for the GPU rendering pipeline, expands support for the Lottie and SVG specifications, adds experimental OpenType (OTF) font support, and further enhances the WebCanvas ecosystem with a pluggable font architecture and multi-threading support. Together, these improvements strengthen ThorVG as a lightweight, high-performance vector graphics engine capable of serving everything from embedded systems to modern web and desktop applications.

Beyond the rendering engine itself, v1.1 continues to expand the ThorVG ecosystem with new platform integrations, improved tooling, and interactive demonstrations that simplify adoption and showcase real-world capabilities. These efforts reflect ThorVG's continued evolution as a production-ready vector graphics platform for cross-platform graphics applications.

# What's New in v1.1?

Following the major architectural milestone of v1.0, ThorVG v1.1 focuses on refining rendering quality, expanding format compatibility, and strengthening the overall development ecosystem. This release delivers significant improvements across rendering performance, standards compliance, platform integration, and developer workflows—making ThorVG faster, more compatible, and easier to integrate into real-world applications.

- Significant GPU rendering performance improvements through rendering pipeline optimizations and batching enhancements
- More accurate and consistent stroke rendering, delivering improved visual fidelity across CPU and GPU engines
- Experimental OpenType (OTF) font support together with an enhanced font loading architecture for WebCanvas
- Expanded Lottie animation capabilities, including experimental Dynamic Tweening and faster Expressions processing
- Improved Lottie and SVG specification compliance, delivering better compatibility with real-world content
- New platform and ecosystem enhancements, including Android OpenGL support, WebCanvas multi-threading, and pluggable font providers
- Continued improvements in rendering quality, stability, and overall production readiness

> We recommend developers to carefully review this release note before upgrading existing projects or starting new ones with v1.1. See the F. API & Integration Updates for details.

