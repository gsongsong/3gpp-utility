<template>
  <nav class="navbar is-success" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">3GPP</router-link>
      <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false"
         data-target="navbar-main">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div id="navbar-main" class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">Home</router-link>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">ASN.1</a>

          <div class="navbar-dropdown">
            <router-link to="/formatter" class="navbar-item">Formatter</router-link>
            <router-link to="/diff" class="navbar-item">Diff</router-link>
          </div>
        </div>
        <router-link to="/idc" class="navbar-item">HM/IMD</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
      // Add a click event on each of them
      $navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          const target = el.dataset.target
          const $target = document.getElementById(target)

          // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active')
          $target.classList.toggle('is-active')
        })
      })
    }
  })

  export default {
  }
</script>

<style>
</style>
