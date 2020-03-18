<template>
  <nav class="navbar is-success" role="navigation">
    <div class="navbar-brand">
      <span class="navbar-item">3GPP Utilities</span>
      <a role="button" class="navbar-burger burger" data-target="navbar-main">
        <span />
        <span />
        <span />
      </a>
    </div>
    <div id="navbar-main" class="navbar-menu">
      <div class="navbar-start">
        <!-- <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Standardization</a>

          <div class="navbar-dropdown"> -->
            <router-link to="/" class="navbar-item">Specification</router-link>
            <!-- <router-link to="/meeting" class="navbar-item">Meeting</router-link>
          </div>
        </div> -->

        <!-- <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Message/IE</a>

          <div class="navbar-dropdown"> -->
            <router-link to="/formatter" class="navbar-item">Formatter</router-link>
            <!-- <router-link to="/diff" class="navbar-item">Diff</router-link>
          </div>
        </div>
        <router-link to="/idc" class="navbar-item">HM/IMD</router-link> -->
      </div>
    </div>
    <div class="navbar-end">
      <div class="navbar-item">
        <a class="button is-info is-small" v-if="newVersionAvailable" @click="openRelease">
          New version available!
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
  import * as urlJoin from 'url-join'
  import { shell, ipcRenderer } from 'electron'
  import { repository } from '../../../package.json'

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
    data () {
      return {
        newVersionAvailable: false
      }
    },
    methods: {
      openRelease () {
        shell.openExternal(urlJoin(repository.url, 'releases/latest'))
      }
    },
    mounted () {
      ipcRenderer.on('new-version-available', (event, data) => {
        this.newVersionAvailable = true
      })
      ipcRenderer.send('version-check-request')
    }
  }
</script>

<style>
</style>
