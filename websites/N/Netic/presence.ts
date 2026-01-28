const presence = new Presence({
  clientId: '1463164944433414154',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://netic.jtheberg.cloud/public/netic512.png',
}

// Cache pour les conversations depuis l'API
let conversationsCache: Array<{id: number, title: string}> = []
let currentConversationId: number | null = null
let lastTitleSearch = 0
const TITLE_SEARCH_INTERVAL = 60000 // 60 secondes = 1 minute

// Approches multiples pour détecter l'ID de conversation

// 1. Performance Observer pour les requêtes fetch
try {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name && typeof entry.name === 'string') {
          const url = entry.name

          if (url.includes('/api/conversations/') && url.includes('/messages')) {
            const match = url.match(/\/api\/conversations\/(\d+)\/messages/)
            if (match && match[1]) {
              const conversationId = parseInt(match[1])
              if (conversationId !== currentConversationId) {
                console.log('🔍 [Netic] Conversation détectée via Performance Observer - ID:', conversationId)
                currentConversationId = conversationId
              }
            }
          }

          if (url.includes('/api/conversations') && !url.includes('/messages')) {
            console.log('📡 [Netic] Liste conversations détectée')
            fetchConversationsList()
          }
        }
      }
    })
    observer.observe({ entryTypes: ['resource'] })
    console.log('👁️ [Netic] Performance Observer activé')
  }
} catch (error) {
  console.log('❌ [Netic] Performance Observer indisponible:', error)
}

// 2. Override XMLHttpRequest pour les anciennes APIs
const originalXMLHttpRequest = window.XMLHttpRequest
const originalXMLHttpRequestOpen = originalXMLHttpRequest.prototype.open
const originalXMLHttpRequestSend = originalXMLHttpRequest.prototype.send

originalXMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
  const urlString = url.toString()
  if (urlString.includes('/api/conversations/') && urlString.includes('/messages')) {
    const match = urlString.match(/\/api\/conversations\/(\d+)\/messages/)
    if (match && match[1]) {
      const conversationId = parseInt(match[1])
      if (conversationId !== currentConversationId) {
        console.log('🔍 [Netic] Conversation détectée via XMLHttpRequest - ID:', conversationId)
        currentConversationId = conversationId
      }
    }
  }

  if (urlString.includes('/api/conversations') && !urlString.includes('/messages')) {
    console.log('📡 [Netic] Liste conversations via XMLHttpRequest')
    setTimeout(fetchConversationsList, 500)
  }

  return originalXMLHttpRequestOpen.call(this, method, url, async ?? true, user, password)
}

// 3. Recherche périodique dans les variables globales et le DOM
function searchForConversationId() {
  try {
    // Chercher dans les variables globales
    const possibleVars = ['currentConversationId', 'chatId', 'conversationId', 'activeChatId']
    for (const varName of possibleVars) {
      const value = (window as any)[varName]
      if (value && (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)))) {
        const id = typeof value === 'string' ? parseInt(value) : value
        if (id !== currentConversationId) {
          console.log('🔍 [Netic] ID trouvé dans variable globale:', varName, '=', id)
          currentConversationId = id
          return
        }
      }
    }

    // Chercher dans le DOM
    const selectors = ['[data-conversation-id]', '[data-chat-id]', '[data-id]']
    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        const id = element.getAttribute('data-conversation-id') ||
                   element.getAttribute('data-chat-id') ||
                   element.getAttribute('data-id')
        if (id && /^\d+$/.test(id)) {
          const parsedId = parseInt(id)
          if (parsedId !== currentConversationId) {
            console.log('🔍 [Netic] ID trouvé dans DOM:', selector, '=', parsedId)
            currentConversationId = parsedId
            return
          }
        }
      }
    }

    // Chercher dans l'URL hash ou search params
    const hashMatch = window.location.hash.match(/[#&](?:chat|conversation)[=:](\d+)/)
    if (hashMatch && hashMatch[1]) {
      const id = parseInt(hashMatch[1])
      if (id !== currentConversationId) {
        console.log('🔍 [Netic] ID trouvé dans hash:', id)
        currentConversationId = id
        return
      }
    }

    const searchMatch = window.location.search.match(/[?&](?:chat|conversation)[=:](\d+)/)
    if (searchMatch && searchMatch[1]) {
      const id = parseInt(searchMatch[1])
      if (id !== currentConversationId) {
        console.log('🔍 [Netic] ID trouvé dans search params:', id)
        currentConversationId = id
        return
      }
    }

  } catch (error) {
    console.log('❌ [Netic] Erreur dans la recherche d\'ID:', error)
  }
}

// Lancer la recherche périodique
setInterval(searchForConversationId, 2000)
console.log('🔄 [Netic] Recherche périodique d\'ID activée')

// Fonction pour récupérer la liste des conversations
async function fetchConversationsList() {
  try {
    console.log('🔄 [Netic] Actualisation de la liste des conversations...')
    const response = await fetch('https://netic.jtheberg.cloud/api/conversations')
    if (response.ok) {
      const data = await response.json()
      if (data.conversations && Array.isArray(data.conversations)) {
        const oldCount = conversationsCache.length
        conversationsCache = data.conversations.map((conv: any) => ({
          id: conv.id,
          title: conv.title
        }))

        const newCount = conversationsCache.length
        console.log('✅ [Netic] Liste conversations mise à jour:', oldCount, '→', newCount, 'conversations')

        if (conversationsCache.length <= 5) {
          conversationsCache.forEach(conv => {
            console.log(`   - ID ${conv.id}: "${conv.title}"`)
          })
        } else {
          conversationsCache.slice(0, 3).forEach(conv => {
            console.log(`   - ID ${conv.id}: "${conv.title}"`)
          })
          console.log(`   ... et ${conversationsCache.length - 3} autres`)
        }
      }
    }
  } catch (error) {
    console.log('❌ [Netic] Erreur récupération conversations:', error)
  }
}

// Récupérer les conversations au démarrage et toutes les minutes
setTimeout(fetchConversationsList, 1000)
setInterval(fetchConversationsList, 60000) // 60 secondes = 1 minute

function getConversationTitle(): string | null {
  const now = Date.now()

  // Recherche active seulement toutes les minutes pour éviter le spam console
  if (now - lastTitleSearch > TITLE_SEARCH_INTERVAL) {
    lastTitleSearch = now

    console.log('🔎 [Netic] Recherche active du titre de conversation...')
    console.log('   ID actuel:', currentConversationId)
    console.log('   Cache conversations:', conversationsCache.length, 'éléments')

    // Approche de secours : chercher dans l'URL si elle contient un ID
    if (!currentConversationId && window.location.pathname.includes('/chat/')) {
      const match = window.location.pathname.match(/\/chat\/(\d+)/)
      if (match && match[1]) {
        currentConversationId = parseInt(match[1])
        console.log('🔍 [Netic] ID trouvé dans l\'URL:', currentConversationId)
      }
    }

    // Si on a un ID mais pas de titre dans le cache, essayer de récupérer directement
    if (currentConversationId && conversationsCache.length === 0) {
      console.log('🌐 [Netic] Pas de cache, appel API direct pour ID:', currentConversationId)
      // Faire un appel API direct pour cette conversation
      setTimeout(() => {
        fetch(`https://netic.jtheberg.cloud/api/conversations/${currentConversationId}`)
          .then(response => response.json())
          .then(data => {
            if (data.title && data.title !== '...') {
              console.log('✅ [Netic] Titre récupéré via API direct:', `"${data.title}"`)
              conversationsCache.push({ id: data.id, title: data.title })
            }
          })
          .catch(error => console.log('❌ [Netic] Erreur API direct:', error))
      }, 100)
    }

    if (!currentConversationId) {
      console.log('❓ [Netic] Aucun ID de conversation détecté')
    }
  }

  // Toujours retourner le titre du cache si disponible (sans logs)
  if (currentConversationId && conversationsCache.length > 0) {
    const conversation = conversationsCache.find(conv => conv.id === currentConversationId)
    if (conversation && conversation.title && conversation.title !== '...') {
      return conversation.title
    }
  }

  return null
}

presence.on('UpdateData', async () => {
  console.log('🔄 [Netic] Mise à jour de la présence...')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const { pathname } = document.location
  const [showTimestamp, showConversationTitle] = await Promise.all([
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<boolean>('showConversationTitle')
  ])

  // Détection des différentes pages
  if (pathname === '/' || pathname === '') {
    presenceData.details = 'Visite la page d\'accueil'
    presenceData.state = 'Découvrez Netic AI'
  } else if (pathname === '/login') {
    presenceData.details = 'Page de connexion'
    presenceData.state = 'Se connecte à Netic'
  } else if (pathname === '/admin') {
    presenceData.details = 'Administration'
    presenceData.state = 'Gère Netic AI'
  } else if (pathname.startsWith('/chat')) {
    // Vérifier si la page est en cours de chargement
    const isLoading = document.querySelector('div')?.textContent?.includes('Chargement')

    if (isLoading) {
      presenceData.details = 'Chargement du chat'
      presenceData.state = 'Connexion à Netic...'
    } else {
      // Essayer de récupérer le titre si activé
      if (showConversationTitle) {
        const conversationTitle = getConversationTitle()
        presenceData.details = 'En conversation'
        presenceData.state = conversationTitle || 'Discute avec l\'IA Netic'
      } else {
        presenceData.details = 'En conversation'
        presenceData.state = 'Discute avec l\'IA Netic'
      }
    }
  } else {
    presenceData.details = 'Navigue sur Netic'
    presenceData.state = 'Assistant IA intelligent'
  }

  // Gestion du timestamp selon les paramètres utilisateur
  if (!showTimestamp) {
    presenceData.startTimestamp = undefined
  }

  presence.setActivity(presenceData)
})