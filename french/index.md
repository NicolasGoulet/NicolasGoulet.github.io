---
permalink: /french/
title: ""
layout: single
author_profile: false
lang: fr
alternate_url: /
body_class: home-page
description: "Nicolas Goulet est doctorant à HEC Montréal et Mila, où il étudie l’acquisition du langage chez les humains et les machines."
redirect_from:
  - /french/about/
  - /french/about.html
---

<div class="home-shell">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-hero__copy">
      <p class="eyebrow">Doctorant · Montréal</p>
      <h1 id="home-title">Nicolas<br><em>Goulet</em></h1>
      <p class="home-hero__lead">
        J’étudie comment le langage prend forme dans l’esprit humain et dans les modèles artificiels.
      </p>
      <p class="home-hero__bio">
        Je suis doctorant à <strong>HEC Montréal × Mila</strong> sous la direction
        de la professeure Eva Portelance. Mes travaux se situent au croisement de
        l’acquisition du langage, des sciences cognitives et de l’intelligence artificielle.
      </p>
      <div class="home-actions">
        <a class="button button--primary" href="/french/academic-interests/">Voir ma recherche <span aria-hidden="true">↗</span></a>
        <a class="button button--quiet" href="/writing/">Lire mon carnet <span aria-hidden="true">→</span></a>
      </div>
    </div>

    <figure class="portrait-frame">
      <div class="portrait-frame__halo" aria-hidden="true"></div>
      <img src="/images/profile.png" alt="Portrait de Nicolas Goulet" width="800" height="800" fetchpriority="high">
      <figcaption><span>Établi à</span> Montréal, Québec</figcaption>
    </figure>
  </section>

  <section class="home-statement" aria-label="À propos">
    <p class="home-statement__number" aria-hidden="true">01</p>
    <p>
      Ma recherche part d’une question simple, mais difficile :
      <em>comment les mots en viennent-ils à signifier quelque chose?</em>
      Je l’aborde par les modèles computationnels, l’apprentissage humain et
      le problème de l’ancrage du langage dans le monde.
    </p>
  </section>

  <section class="home-cards" aria-label="Champs d’intérêt">
    <article class="interest-card">
      <span class="interest-card__index">A</span>
      <h2>Langage &amp; apprentissage</h2>
      <p>Comment la structure linguistique émerge de l’expérience, chez l’enfant comme dans les machines.</p>
      <a href="/french/academic-interests/">Notes de recherche <span aria-hidden="true">→</span></a>
    </article>
    <article class="interest-card">
      <span class="interest-card__index">B</span>
      <h2>Livres &amp; idées</h2>
      <p>Des lectures lentes en littérature, philosophie, cognition et pensée sociale.</p>
      <a href="/french/books/">Ouvrir la bibliothèque <span aria-hidden="true">→</span></a>
    </article>
    <article class="interest-card">
      <span class="interest-card__index">C</span>
      <h2>Musique &amp; pratique</h2>
      <p>Notes du piano : répertoire, interprétation et travail de la répétition.</p>
      <a href="/french/music/">Au piano <span aria-hidden="true">→</span></a>
    </article>
  </section>

  {% assign latest_post = site.posts.first %}
  {% if latest_post %}
  <section class="latest-note" aria-labelledby="latest-note-title">
    <div class="latest-note__label">
      <p class="eyebrow">Du carnet</p>
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
