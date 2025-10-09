import { AppAction, AppState, AuthContextState, UserInfo } from './types/app.types'

export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'CHANGE_TITLE':
            return { ...state, title: action.newTitle }

        case 'CHANGE_USER_INFO': {
            const incoming = action.newUserInfo
            return {
                ...state,
                userInfo:
                (('name' in (incoming as UserInfo) || 'email' in (incoming as UserInfo))
                    ? (incoming as UserInfo)
                    : { ...state.userInfo, ...(incoming as Partial<UserInfo>) }),
            }
        }

        case 'CHANGE_AUTH_CONTEXT': {
            const incoming = action.newAuthContext
            return {
                ...state,
                authContext:
                (('isLoggedIn' in (incoming as AuthContextState) || 'token' in (incoming as AuthContextState))
                    ? (incoming as AuthContextState)
                    : { ...state.authContext, ...(incoming as Partial<AuthContextState>) }),
            }
        }

        case 'SHOW_NAVBAR':
            return { ...state, navBarState: action.isActive }

        case 'SHOW_LOADER':
            return { ...state, isLoading: action.isActive }

        default:
            return state
    }
}