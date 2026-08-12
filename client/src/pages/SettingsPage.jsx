import { useNavigate } from 'react-router-dom';
import {
	ChevronRight,
	Search,
	MoreVertical,
	User,
	MessageSquare,
	Shield,
	Bell,
	Database,
	Folder,
	Laptop,
	Battery,
	Moon,
	LogOut,
	Users,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';
import { Avatar } from '../components/common/Avatar.jsx';

function SettingsItem({ icon, title, subtitle, onClick, rightText }) {
	return (
		<button type='button' className='settings-item' onClick={onClick}>
			<span className='settings-item__icon'>{icon}</span>
			<span className='settings-item__body'>
				<span className='settings-item__title'>{title}</span>
				{subtitle ? <span className='settings-item__subtitle'>{subtitle}</span> : null}
			</span>
			{rightText ? <span className='settings-item__right-text'>{rightText}</span> : <ChevronRight size={18} />}
		</button>
	);
}

export function SettingsPage() {
	const { user, logout } = useAuth();
	const { isDark, toggleTheme } = useTheme();
	const navigate = useNavigate();

	const phoneText = user?.phone || '@' + (user?.username || 'user');

	return (
		<div className='page settings-page'>
			<header className='page-header settings-header'>
				<h1>Sozlamalar</h1>
				<button type='button' className='icon-button' aria-label='Qidirish'>
					<Search size={20} strokeWidth={2} />
				</button>
				<button type='button' className='icon-button' aria-label='Qo‘shimcha'>
					<MoreVertical size={20} strokeWidth={2} />
				</button>
			</header>

			<div className='page-body settings-body'>
				<button type='button' className='settings-profile-card' onClick={() => navigate('/profile')}>
					<Avatar
						userId={user?.id || 'x'}
						name={user?.displayName || 'User'}
						avatarUrl={user?.avatarUrl}
						size={96}
						expandable
					/>
					<h2>{user?.displayName || 'User'}</h2>
					<p>{phoneText}</p>
				</button>

				<section className='settings-block'>
					<h3 className='settings-block__title'>Hisoblar</h3>
					<SettingsItem
						icon={
							<Avatar
								userId={user?.id || 'x'}
								name={user?.displayName || 'U'}
								avatarUrl={user?.avatarUrl}
								size={36}
							/>
						}
						title={user?.displayName || 'Hisob'}
						subtitle='Asosiy hisob'
						onClick={() => navigate('/profile')}
					/>
				</section>

				<section className='settings-block'>
					<h3 className='settings-block__title'>Chatlar</h3>
					<SettingsItem
						icon={<Users size={18} />}
						title='Yangi guruh'
						subtitle='Guruh suhbat yaratish'
						onClick={() => navigate('/new-group')}
					/>
				</section>

				<section className='settings-block'>
					<SettingsItem
						icon={<Moon size={18} />}
						title='Tungi rejim'
						subtitle='Interfeys mavzusi'
						onClick={toggleTheme}
						rightText={isDark ? 'Yoqilgan' : 'O‘chiq'}
					/>
					<SettingsItem
						icon={<LogOut size={18} />}
						title='Chiqish'
						subtitle='Hisobdan chiqish'
						onClick={logout}
					/>
				</section>
			</div>
		</div>
	);
}
