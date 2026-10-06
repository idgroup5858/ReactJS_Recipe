import { createBrowserRouter } from 'react-router'
import AppLayout from '@/components/layout/AppLayout'
import AppLoading from '@/components/layout/AppLoading'
import LanguageScope from '@/components/layout/LanguageScope'
import CategoryPage from '@/pages/category/CategoryPage'
import NotFoundPage from '@/pages/errors/NotFoundPage'
import RootError from '@/pages/errors/RootError'
import RouteError from '@/pages/errors/RouteError'
import FavoritesPage from '@/pages/favorites/FavoritesPage'
import HomePage from '@/pages/home/HomePage'
import SearchPage from '@/pages/search/SearchPage'
import SettingsPage from '@/pages/settings/SettingsPage'
import TopicPage from '@/pages/topic/TopicPage'
import {
  categoryLoader,
  homeRedirectLoader,
  languageLoader,
  rootLoader,
  topicLoader,
  type CategoryData,
  type LanguageData,
  type TopicData,
} from './loaders'
import { LANGUAGE_ROUTE_ID, ROOT_ROUTE_ID } from './routeData'
import { crumbsHandle } from './routeHandle'

/**
 * Sahifalar (Android'dagi Routes / AppNavHost):
 *
 *   /                                → oxirgi tanlangan til
 *   /:lang                           → bo'limlar ro'yxati
 *   /:lang/:categoryId               → bo'lim mavzulari
 *   /:lang/:categoryId/:topicId#ex5  → mavzu (ixtiyoriy ravishda aniq misolgacha)
 *   /search?q=  /favorites  /settings?tab=
 */
export const router = createBrowserRouter([
  {
    id: ROOT_ROUTE_ID,
    path: '/',
    loader: rootLoader,
    Component: AppLayout,
    HydrateFallback: AppLoading,
    ErrorBoundary: RootError,
    children: [
      // har doim yo'naltiradi — o'zi hech narsa chizmaydi
      { index: true, loader: homeRedirectLoader, element: null },
      { path: 'search', Component: SearchPage, handle: crumbsHandle(() => [{ label: 'Qidiruv' }]) },
      { path: 'favorites', Component: FavoritesPage, handle: crumbsHandle(() => [{ label: 'Sevimlilar' }]) },
      { path: 'settings', Component: SettingsPage, handle: crumbsHandle(() => [{ label: 'Sozlamalar' }]) },
      {
        id: LANGUAGE_ROUTE_ID,
        path: ':lang',
        loader: languageLoader,
        Component: LanguageScope,
        ErrorBoundary: RouteError,
        handle: crumbsHandle<LanguageData>((data) =>
          data ? [{ label: data.language.name, to: `/${data.language.id}` }] : [],
        ),
        children: [
          { index: true, Component: HomePage },
          {
            path: ':categoryId',
            loader: categoryLoader,
            Component: CategoryPage,
            handle: crumbsHandle<CategoryData>((data) => (data ? [{ label: data.category.title }] : [])),
          },
          {
            path: ':categoryId/:topicId',
            loader: topicLoader,
            Component: TopicPage,
            handle: crumbsHandle<TopicData>((data, params) =>
              data
                ? [{ label: data.category.title, to: `/${params.lang}/${data.category.id}` }, { label: data.topic.title }]
                : [],
            ),
          },
        ],
      },
      { path: '*', Component: NotFoundPage, handle: crumbsHandle(() => [{ label: 'Sahifa topilmadi' }]) },
    ],
  },
])
