import { useCallback, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { BackButton } from '../components/common/BackButton.jsx';
import {
	fetchStats,
	fetchAllUsers,
	fetchAllChats,
	fetchDeletedMessages,
	fetchDeletedChats,
	deleteMessagePermanently,
	deleteChatPermanently,
	purgeAllDeleted,
} from '../api/admin.api.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Spinner } from '../components/common/Spinner.jsx';
import { formatLastMessage } from '../utils/formatLastMessage.js';

export function AdminPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [stats, setStats] = useState(null);
	const [users, setUsers] = useState([]);
	const [chats, setChats] = useState([]);
	const [deletedMessages, setDeletedMessages] = useState([]);
	const [deletedChats, setDeletedChats] = useState([]);
	const [confirmAction, setConfirmAction] = useState(null);

	const reload = useCallback(async () => {
		const [s, u, c, dm, dc] = await Promise.all([
			fetchStats(),
			fetchAllUsers(),
			fetchAllChats(),
			fetchDeletedMessages(),
			fetchDeletedChats(),
		]);
		setStats(s);
		setUsers(u);
		setChats(c);
		setDeletedMessages(dm);
		setDeletedChats(dc);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		reload();
	}, [reload]);

	function askDeleteMessage(message) {
		setConfirmAction({
			title: 'Xabarni butunlay o‘chirish',
			message: 'Bu amalni ortga qaytarib bo‘lmaydi. Xabar va unga tegishli fayl butunlay o‘chiriladi.',
			actions: [
				{
					label: 'O‘chirish',
					variant: 'danger',
					onClick: async () => {
						await deleteMessagePermanently(message.id);
						setConfirmAction(null);
						reload();
					},
				},
			],
		});
	}

	function askDeleteChat(chat) {
		setConfirmAction({
			title: 'Chatni butunlay o‘chirish',
			message: `"${chat.name}" chati va uning barcha xabarlari/fayllari butunlay o‘chiriladi.`,
			actions: [
				{
					label: 'O‘chirish',
					variant: 'danger',
					onClick: async () => {
						await deleteChatPermanently(chat.id);
						setConfirmAction(null);
						reload();
					},
				},
			],
		});
	}

	function askPurgeAll() {
		setConfirmAction({
			title: 'Hammasini tozalash',
			message: 'Barcha o‘chirilgan (draft) xabar va chatlar, ularning fayllari bilan birga butunlay o‘chiriladi.',
			actions: [
				{
					label: 'Hammasini o‘chirish',
					variant: 'danger',
					onClick: async () => {
						await purgeAllDeleted();
						setConfirmAction(null);
						reload();
					},
				},
			],
		});
	}

	if (isLoading) {
		return (
			<div className='admin-page screen-center'>
				<Spinner size={32} />
			</div>
		);
	}

	return (
		<div className='admin-page'>
			<header className='admin-header'>
				<BackButton to="/chats" />
				<h1><Shield size={18} strokeWidth={2} className="admin-header__icon" /> Admin panel</h1>
				<button className='admin-purge-btn' onClick={askPurgeAll}>
					Hammasini tozalash
				</button>
			</header>

			<div className='admin-body'>
				<div className='admin-stats'>
					<StatCard label='Foydalanuvchilar' value={stats.userCount} />
					<StatCard label='Faol chatlar' value={stats.chatCount} />
					<StatCard label='Xabarlar' value={stats.messageCount} />
					<StatCard label='O‘chirilgan chatlar' value={stats.deletedChatCount} variant='danger' />
					<StatCard label='O‘chirilgan xabarlar' value={stats.deletedMessageCount} variant='danger' />
				</div>

				<section className='admin-section'>
					<h2>Foydalanuvchilar</h2>
					<div className='admin-table-wrap'>
						<table className='admin-table'>
							<thead>
								<tr>
									<th>Ism</th>
									<th>Username</th>
									<th>Rol</th>
									<th>Holat</th>
									<th>Ro‘yxatdan o‘tgan</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr key={u.id}>
										<td>{u.displayName}</td>
										<td>{u.username}</td>
										<td>{u.isAdmin ? 'Admin' : 'Foydalanuvchi'}</td>
										<td>{u.isOnline ? 'Onlayn' : 'Offlayn'}</td>
										<td>{new Date(u.createdAt).toLocaleString()}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className='admin-section'>
					<h2>Barcha chatlar</h2>
					<div className='admin-table-wrap'>
						<table className='admin-table'>
							<thead>
								<tr>
									<th>Turi</th>
									<th>Nomi</th>
									<th>Xabarlar</th>
									<th>Holati</th>
								</tr>
							</thead>
							<tbody>
								{chats.map((c) => (
									<tr key={c.id}>
										<td>{c.type === 'GROUP' ? 'Guruh' : 'Shaxsiy'}</td>
										<td>{c.name}</td>
										<td>{c.messageCount}</td>
										<td>{c.deletedAt ? 'O‘chirilgan' : 'Faol'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>

				<section className='admin-section'>
					<h2>O‘chirilgan xabarlar (draftlar)</h2>
					{deletedMessages.length === 0 && <p className='admin-empty'>Draft xabarlar yo‘q</p>}
					{deletedMessages.map((m) => (
						<div key={m.id} className='admin-list-row'>
							<div className='admin-list-row__body'>
								<span className='admin-list-row__title'>
									{m.sender?.displayName} → {m.chat?.name || m.chat?.type}
								</span>
								<span className='admin-list-row__subtitle'>{formatLastMessage(m)}</span>
							</div>
							<button className='admin-delete-btn' onClick={() => askDeleteMessage(m)}>
								O‘chirish
							</button>
						</div>
					))}
				</section>

				<section className='admin-section'>
					<h2>O‘chirilgan chatlar</h2>
					{deletedChats.length === 0 && <p className='admin-empty'>O‘chirilgan chatlar yo‘q</p>}
					{deletedChats.map((c) => (
						<div key={c.id} className='admin-list-row'>
							<div className='admin-list-row__body'>
								<span className='admin-list-row__title'>{c.name}</span>
								<span className='admin-list-row__subtitle'>{c.messageCount} ta xabar</span>
							</div>
							<button className='admin-delete-btn' onClick={() => askDeleteChat(c)}>
								O‘chirish
							</button>
						</div>
					))}
				</section>
			</div>

			{confirmAction && <ConfirmDialog {...confirmAction} onCancel={() => setConfirmAction(null)} />}
		</div>
	);
}

function StatCard({ label, value, variant }) {
	return (
		<div className={`stat-card ${variant ? `stat-card--${variant}` : ''}`}>
			<span className='stat-card__value'>{value}</span>
			<span className='stat-card__label'>{label}</span>
		</div>
	);
}
