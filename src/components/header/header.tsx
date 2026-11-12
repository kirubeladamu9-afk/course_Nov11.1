import React, { FC, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Logo } from '@/components/logo'
import { Navigation, AuthNavigation } from '@/components/navigation'
import { socialLinks } from '@/components/footer/footer-social-links'
import { toast } from '@/components/toast'
import { getAuthenticatedUser, signOut } from '@/services/api'
import { navigateTo } from '@/lib/navigation'
import { useTheme } from '@mui/material/styles'
import { Close, DarkModeOutlined, LightModeOutlined, Menu } from '@mui/icons-material'

const iconButtonSx = {
  color: 'primary.main',
}

interface Props {
  darkMode: boolean
  showSocialLinks?: boolean
  onToggleDarkMode: () => void
}

const Header: FC<Props> = ({ darkMode, showSocialLinks = false, onToggleDarkMode }) => {
  const [visibleMenu, setVisibleMenu] = useState<boolean>(false)
  const currentUser = getAuthenticatedUser()
  const isAdmin = currentUser?.role === 'admin'
  const isTutor = currentUser?.role === 'tutor'
  const isStudent = currentUser?.role === 'student'
  const { breakpoints } = useTheme()
  const matchMobileView = useMediaQuery(breakpoints.down('md'))

  const closeMenu = () => setVisibleMenu(false)
  const withCloseMenu = (action: () => void) => () => {
    closeMenu()
    action()
  }

  return (
    <Box sx={{ position: 'relative', zIndex: 1, backgroundColor: 'background.paper' }}>
      <Container sx={{ py: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo onClick={() => navigateTo('/')} />
          <Box sx={{ ml: 'auto', display: { xs: 'inline-flex', md: 'none' } }}>
            <IconButton
              onClick={() => setVisibleMenu(!visibleMenu)}
              aria-label={visibleMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={visibleMenu}
              sx={iconButtonSx}
            >
              <Menu />
            </IconButton>
          </Box>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', md: 'row' },

              transition: (theme) => theme.transitions.create(['top']),
              ...(matchMobileView && {
                py: 6,
                backgroundColor: 'background.paper',
                zIndex: 'appBar',
                position: 'fixed',
                height: { xs: '100vh', md: 'auto' },
                top: visibleMenu ? 0 : '-120vh',
                left: 0,
              }),
            }}
          >
            <Box /> {/* Magic space */}
            <Navigation isAdmin={isAdmin} onNavigate={closeMenu} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showSocialLinks && <Box component="ul" aria-label="Social links" sx={{ display: 'flex', alignItems: 'center', gap: 0.25, m: 0, p: 0, listStyle: 'none' }}>
                {socialLinks.map((item) => <Box component="li" key={item.name}>
                  <Link href={item.link} target="_blank" rel="noreferrer" aria-label={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' }, '& img': { width: 18, height: 18 } }}>
                    <img src={item.icon} alt="" />
                  </Link>
                </Box>)}
              </Box>}
              <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton onClick={onToggleDarkMode} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} sx={iconButtonSx}>
                  {darkMode ? <LightModeOutlined /> : <DarkModeOutlined />}
                </IconButton>
              </Tooltip>
              <AuthNavigation isAdmin={isAdmin} isTutor={isTutor} isStudent={isStudent} darkMode={darkMode} onSignIn={withCloseMenu(() => navigateTo('/sign-in'))} onAdminDashboard={withCloseMenu(() => navigateTo('/admin'))} onTutorDashboard={withCloseMenu(() => navigateTo('/tutor'))} onStudentDashboard={withCloseMenu(() => navigateTo('/dashboard'))} onSignOut={withCloseMenu(() => { void signOut().then(() => { toast.add({ title: 'Signed out', description: 'You have been successfully logged out.', type: 'success' }); navigateTo('/', true) }) })} />
            </Box>
            {visibleMenu && matchMobileView && (
              <IconButton
                sx={{
                  ...iconButtonSx,
                  position: 'fixed',
                  top: 10,
                  right: 10,
                }}
                onClick={() => setVisibleMenu(!visibleMenu)}
                aria-label="Close navigation menu"
              >
                <Close />
              </IconButton>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Header
