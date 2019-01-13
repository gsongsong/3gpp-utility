<template>
  <nav class="navbar is-success" role="navigation">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item">3GPP</router-link>
      <a role="button" class="navbar-burger burger" data-target="navbar-main">
        <span />
        <span />
        <span />
      </a>
    </div>
    <div id="navbar-main" class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">Home</router-link>
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Message/IE</a>

          <div class="navbar-dropdown">
            <router-link to="/formatter" class="navbar-item">Formatter</router-link>
            <router-link to="/diff" class="navbar-item">Diff</router-link>
          </div>
        </div>
        <router-link to="/idc" class="navbar-item">HM/IMD</router-link>
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
  import * as request from 'request'
  import { parse } from 'url'
  import * as urlJoin from 'url-join'
  import { remote, shell } from 'electron'
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
        version: remote.app.getVersion(),
        newVersionAvailable: false
      }
    },
    methods: {
      openRelease () {
        shell.openExternal(urlJoin(repository.url, 'releases/latest'))
      }
    },
    mounted () {
      const urlObj = parse(repository.url)
      const apiReleasesUrl = urlJoin(urlObj.protocol, 'api.github.com', 'repos', urlObj.path, 'releases/latest')
      const headers = {
        'User-Agent': 'gsongsong/3gpp-electron',
        'Authorization': 'token 5c68b07d9bd331aef636501c0ff8172a495a30d6'
      }
      request({url: apiReleasesUrl, headers: headers},
        (e, res, body) => {
          let json = {}
          try {
            json = JSON.parse(body)
          } catch (e) {
            return
          }
          if (!('tag_name' in json)) {
            return
          }
          const tagName = json.tag_name
          const last = tagName.substring(1).split('.').map(el => Number(el))
          const curr = this.version.split('.').map(el => Number(el))
          for (let i = 0; i < last.length; i++) {
            if (last[i] > curr[i]) {
              this.newVersionAvailable = true
            } else if (last[i] === curr[i]) {
              continue
            } else {
              break
            }
          }
        })
    }
  }
</script>

<style>
</style>
