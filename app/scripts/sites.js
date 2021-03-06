'use strict';

export const DOMAIN_PATTERN = /^https?:\/\/([^\/:?#]+)(?:[\/:?#]|$)/

/*
* Comments configs
* 'domain': { ...domain config }
* */
export const Sites = {
  'www.youtube.com': {
    pageTypes: {
      _default: '\\/'
    },
    paths: ['\/watch'],
    pageContainers: {
      _default: [
        {
          selector: '#watch-discussion, #comments'
        }
      ]
    },
    containerContent: {
      _default: {
        comment: {
          block: '.comment-renderer:not([behave]), ytd-comment-renderer.ytd-comment-thread-renderer:not([behave]), ytd-comment-renderer.ytd-comment-replies-renderer:not([behave])',
          text: '.comment-renderer-text-content, yt-formatted-string.ytd-comment-renderer#content-text',
          additionalFakeBlockClasses: ['argh-fakeContent--youtube'],
          additionalFakeBlockControlsClasses: ['argh-controls--youtube']
        }
      }
    }
  },
  'twitter.com': {
    pageTypes: {
      _default: '\\/'
    },
    pageContainers: {
      _default: [
        {
          selector: '.stream'
        }
      ]
    },
    additionalBlockBehaviour: block => {
      block.classList.add('argh-root')
      block.classList.add('argh-root--twitter')
    },
    containerContent: {
      _default: {
        comment: {
          block: '.tweet.js-stream-tweet > .content:not([behave])',
          text: '.js-tweet-text-container',
          additionalFakeBlockClasses: ['argh-fakeContent--twitter'],
          additionalFakeBlockControlsClasses: ['argh-controls--twitter']
        }
      }
    }
  },
  'www.reddit.com': {
    pageTypes: {
      _default: '\\/'
    },
    paths: ['\/r\/'],
    pageContainers: {
      _default: [
        {
          selector: '.commentarea',
        }
      ]
    },
    additionalBlockBehaviour: block => {
      if ('rgb(245, 245, 245)' === window.getComputedStyle(block.parentNode, null).getPropertyValue('background-color')) {
        block.classList.add('argh-root--reddit-theme')
      }
      block.classList.add('argh-root')
      block.classList.add('argh-root--reddit')
    },
    containerContent: {
      _default: {
        comment: {
          block: '.entry.unvoted:not([behave])',
          text: '.usertext-body',
          additionalFakeBlockClasses: ['argh-fakeContent--reddit'],
          additionalFakeBlockControlsClasses: ['argh-controls--reddit']
        }
      }
    }
  },
  'disqus.com': {
    pageTypes: {
      _default: '\\/'
    },
    paths: ['\/embed\/comments\/'],
    pageContainers: {
      _default: [
        {
          selector: '#conversation',
        }
      ]
    },
    containerContent: {
      _default: {
        comment: {
          block: 'div[data-role="post-content"]:not([behave])',
          text: '.post-message',
          additionalFakeBlockClasses: ['argh-fakeContent--disqus'],
          additionalFakeBlockControlsClasses: ['argh-controls--disqus']
        }
      }
    }
  }
}

export const checkPaths = url => {
  const domain = getPageDomain(url)
  if (domain) {
    const { paths } = Sites[domain]
    if (paths) {
      let exist = false
      paths.forEach(path => {
        if (!exist) {
          const pathRegexp = new RegExp(path)
          exist = !!url.match(pathRegexp)
        }
      })
      return exist
    }
    return true
  }
  return false
}

export const getPageDomain = url => {
  if (!url) return null

  const matchedUrl = url.match(DOMAIN_PATTERN) || []
  const site = matchedUrl[1] || null

  if (site && Sites.hasOwnProperty(site)) return site

  return null
}

export const getPageType = (url, domain) => {
  if (!url || !domain) return null

  let pageType = ''

  const pageTypes = Sites[domain].pageTypes

  for (let type in pageTypes) {
    if (!pageType && pageTypes.hasOwnProperty(type)) {
      const typePattern = new RegExp(`${domain.replace(/\./g, '\\\.')}${pageTypes[type]}`)

      if (url.match(typePattern)) pageType = type
    }
  }

  return pageType || '_default'
}

const getPageContainers = (domain, type) => {
  if (!domain || !type) return null

  const { pageContainers } = Sites[domain]

  if (pageContainers && pageContainers[type]) return pageContainers[type]

  return null
}

const getPageContainersContent = (domain, type) => {
  if (!domain || !type) return null

  const { containerContent } = Sites[domain]

  if (containerContent && containerContent[type]) return containerContent[type]

  return null
}

export const getPageInfo = url => {
  const domain = getPageDomain(url)
  const pageType = getPageType(url, domain)
  const pageContainers = getPageContainers(domain, pageType)
  const containerContent = getPageContainersContent(domain, pageType)


  return { domain, pageType, pageContainers, containerContent }
}
