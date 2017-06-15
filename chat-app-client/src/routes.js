import Home from './components/Home.vue';
import Chat from './components/Chat.vue';

export const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/chat',
        component: Chat
    }
];