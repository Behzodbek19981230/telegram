import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Shield } from 'lucide-react';
import { useChats } from '../hooks/useChats.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { ChatListItem } from '../components/chat-list/ChatListItem.jsx';
import { ChatFilterTabs } from '../components/chat-list/ChatFilterTabs.jsx';
import { NewChatMenu } from '../components/chat-list/NewChatMenu.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

function chatTitle(chat) {
	return chat.type === 'GROUP' ? chat.name : chat.otherUser.displayName;
}

export function ChatListPage() {
	const { chats, isLoading } = useChats();
	const presenceMap = usePresence();
	const { user, logout } = useAuth();
	const { isDark, toggleTheme } = useTheme();
	const navigate = useNavigate();
	const [filter, setFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const liveChats = useMemo(
		() => chats.map((c) => (c.type === 'DIRECT' ? { ...c, otherUser: withPresence(c.otherUser, presenceMap) } : c)),
		[chats, presenceMap],
	);

	const unreadChatsCount = useMemo(() => liveChats.filter((c) => c.unreadCount > 0).length, [liveChats]);

	const filteredChats = useMemo(() => {
		let result = liveChats;
		switch (filter) {
			case 'private':
				result = result.filter((c) => c.type === 'DIRECT');
				break;
			case 'groups':
				result = result.filter((c) => c.type === 'GROUP');
				break;
			case 'channels':
				// Hozirda backendda CHAT CHANNEL alohida turi yo'q, shuning uchun GROUP'larni ko'rsatamiz.
				result = result.filter((c) => c.type === 'GROUP');
				break;
			case 'unread':
				result = result.filter((c) => c.unreadCount > 0);
				break;
			default:
				break;
		}
		if (search.trim()) {
			const q = search.trim().toLowerCase();
			result = result.filter((c) => chatTitle(c).toLowerCase().includes(q));
		}
		return result;
	}, [liveChats, filter, search]);

	return (
		<div className='page chat-list-page'>
			<header className='chatlist-header'>
				<div className='chatlist-header__top'>
					<button className='chatlist-header__avatar' onClick={logout} aria-label='Chiqish' title='Chiqish'>
						<Avatar userId={user.id} name={user.displayName} avatarUrl={user.avatarUrl} size={34} expandable />
					</button>
					<h1>Telegram</h1>
					<div className='chatlist-header__actions'>
						{user.isAdmin && (
							<button className='icon-button' onClick={() => navigate('/admin')} aria-label='Admin panel'>
								<Shield size={20} strokeWidth={1.8} />
							</button>
						)}
						<button
							className='icon-button'
							onClick={() => setIsSearchOpen((v) => !v)}
							aria-label='Qidirish'
						>
							<Search size={20} strokeWidth={2} />
						</button>
						<button className='icon-button' onClick={toggleTheme} aria-label='Mavzuni almashtirish'>
							{isDark ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
						</button>
					</div>
				</div>
				{isSearchOpen && (
					<div className='chatlist-search'>
						<Search size={16} strokeWidth={2} className='chatlist-search__icon' />
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder='Qidirish'
							className='chatlist-search__input'
						/>
					</div>
				)}
			</header>

			<ChatFilterTabs active={filter} onChange={setFilter} unreadChatsCount={unreadChatsCount} />

			<div className='page-body'>
				{isLoading && (
					<div className='screen-center'>
						<Spinner />
					</div>
				)}

				{!isLoading && filteredChats.length === 0 && (
					<div className='empty-state'>
						<p>{filter === 'all' && !search ? 'Hozircha suhbatlar yo‘q' : 'Hech narsa topilmadi'}</p>
						{filter === 'all' && !search && (
							<button onClick={() => navigate('/contacts')}>Yangi suhbat boshlash</button>
						)}
					</div>
				)}

				{filteredChats.map((chat) => (
					<ChatListItem key={chat.id} chat={chat} />
				))}
			</div>
		</div>
	);
}
