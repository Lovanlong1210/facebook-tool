import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import authApi from '../services/authApi';

export default function useAuth() {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!router.isReady) return;
		if (router.pathname === '/login' || router.pathname === '/') {
			setLoading(false);
			return;
		}

		let active = true;
		authApi.me()
			.then((result) => { if (active) setUser(result.user); })
			.catch(() => {
				if (active) {
					const returnUrl = `${router.asPath || '/'}`;
					router.replace(`/login?next=${encodeURIComponent(returnUrl)}`);
				}
			})
			.finally(() => { if (active) setLoading(false); });

		return () => { active = false; };
	}, [router.isReady, router.pathname, router.asPath]);

	const logout = async () => {
		try { await authApi.logout(); } finally {
			setUser(null);
			await router.replace('/login?loggedOut=1');
		}
	};

	return { user, loading, logout };
}
