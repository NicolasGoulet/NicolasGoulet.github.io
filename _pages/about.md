---
permalink: /
title: ""
layout: single
author_profile: false
lang: en
alternate_url: /french/
body_class: home-page
description: "Nicolas Goulet is a PhD researcher studying language acquisition in humans and machines at HEC Montréal and Mila."
redirect_from:
  - /about/
  - /about.html
---

<div class="home-shell">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-hero__copy">
      <p class="eyebrow">PhD researcher · Montréal</p>
      <h1 id="home-title">Nicolas<br><em>Goulet</em></h1>
      <p class="home-hero__lead">
        I study how language takes shape in human minds and machine models.
      </p>
      <p class="home-hero__bio">
        I am a PhD student at <strong>HEC Montréal × Mila</strong>, supervised by
        Prof. Eva Portelance. My work sits between language acquisition,
        cognitive science, and artificial intelligence.
      </p>
      <div class="home-actions">
        <a class="button button--primary" href="/academic-interests/">Explore my research <span aria-hidden="true">↗</span></a>
        <a class="button button--quiet" href="/writing/">Read my writing <span aria-hidden="true">→</span></a>
      </div>
    </div>

    <figure class="portrait-frame">
      <div class="portrait-frame__halo" aria-hidden="true"></div>
      <img src="/images/profile.png" alt="Portrait of Nicolas Goulet" width="800" height="800" fetchpriority="high">
      <figcaption><span>Based in</span> Montréal, Québec</figcaption>
    </figure>
  </section>

  <section class="home-statement" aria-label="About">
    <p class="home-statement__number" aria-hidden="true">01</p>
    <p>
      My research asks a simple but difficult question:
      <em>how do words come to mean anything at all?</em>
      I approach it through computational models, human learning, and the
      problem of grounding language in the world.
    </p>
  </section>

  <section class="home-cards" aria-label="Areas of interest">
    <article class="interest-card">
      <span class="interest-card__index">A</span>
      <h2>Language &amp; learning</h2>
      <p>How linguistic structure emerges from experience—in children and in machines.</p>
      <a href="/academic-interests/">Research notes <span aria-hidden="true">→</span></a>
    </article>
    <article class="interest-card">
      <span class="interest-card__index">B</span>
      <h2>Books &amp; ideas</h2>
      <p>Reading slowly across literature, philosophy, cognition, and social thought.</p>
      <a href="/books/">Open the bookshelf <span aria-hidden="true">→</span></a>
    </article>
    <article class="interest-card">
      <span class="interest-card__index">C</span>
      <h2>Music &amp; practice</h2>
      <p>Notes from the piano bench: repertoire, interpretation, and the work of repetition.</p>
      <a href="/music/">At the piano <span aria-hidden="true">→</span></a>
    </article>
  </section>

  {% assign latest_post = site.posts.first %}
  {% if latest_post %}
  <section class="latest-note" aria-labelledby="latest-note-title">
    <div class="latest-note__label">
      <p class="eyebrow">From the notebook</p>
      <span>{{ latest_post.date | date: "%B %Y" }}</span>
    </div>
    <a class="latest-note__link" href="{{ latest_post.url }}">
      <div>
        <h2 id="latest-note-title">{{ latest_post.title }}</h2>
        {% if latest_post.subtitle %}<p class="latest-note__subtitle">{{ latest_post.subtitle }}</p>{% endif %}
        <p>{{ latest_post.excerpt | strip_html | truncatewords: 30 }}</p>
      </div>
      <span class="latest-note__arrow" aria-hidden="true">↗</span>
    </a>
  </section>
  {% endif %}
</div>
