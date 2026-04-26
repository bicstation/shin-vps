// /home/maya/shin-dev/shin-vps/shared/lib/utils/authGuard.ts

// export const requireAuth = async () => {
//   const token = localStorage.getItem('access_token');

//   if (!token) {
//     window.location.href = '/login';
//     return null;
//   }

//   const res = await fetch('http://localhost:8083/api/auth/me/', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!res.ok) {
//     localStorage.clear();
//     window.location.href = '/login';
//     return null;
//   }

//   return await res.json();
// };

export const requireAuth = async () => {
  await new Promise(r => setTimeout(r, 50));

  const token = localStorage.getItem('access_token');
  console.log("TOKEN:", token);

  if (!token) {
    console.log("NO TOKEN");
    window.location.href = '/login';
    return null;
  }

  const res = await fetch('http://localhost:8083/api/auth/me/', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  console.log("AUTH STATUS:", res.status);

  if (!res.ok) {
    console.log("AUTH FAILED");
    localStorage.clear();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json();
  console.log("AUTH SUCCESS:", data);

  return data;
};