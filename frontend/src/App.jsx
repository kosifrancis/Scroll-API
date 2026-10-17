import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  apiRequest,
  createPost,
  assetUrl,
  getComments,
  getFeed,
  getPosts,
  loginUser,
  registerUser,
  recordPostView,
  updateMyProfile,
  uploadProfilePicture,
} from './api/postApi';

const demoPosts = [
  {
    _id: 'preview-1',
    demo: true,
    author: { username: 'nora.ontheroad' },
    content: 'Somewhere between the mountains and the morning light. I think I’ll stay a little longer. ☀️',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1300&q=85' }],
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    _id: 'preview-2',
    demo: true,
    author: { username: 'sunday.studio' },
    content: 'A slower kind of Sunday. Coffee, a good playlist, and nowhere else to be. What does your perfect morning look like?',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1300&q=85' }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: 'preview-3',
    demo: true,
    author: { username: 'frames.by.eli' },
    content: 'Golden hour never needs a filter. ✨',
    media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1300&q=85' }],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const navItems = [
  { id: 'for-you', label: 'For you', icon: 'home' },
  { id: 'following', label: 'Following', icon: 'users' },
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
];

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>,
    bookmark: <><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    heart: <path d="M20.8 8.8c0 4.1-8.8 10-8.8 10s-8.8-5.9-8.8-10a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9Z" />,
    comment: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.6 8.6 0 0 1-7.7 4.8 8.4 8.4 0 0 1-3.8-.9L3 21l1.8-5.6a8.4 8.4 0 0 1-.9-3.9 8.6 8.6 0 0 1 4.8-7.7 8.4 8.4 0 0 1 3.8-.9h.5a8.6 8.6 0 0 1 8 8v.6Z" /></>,
    share: <><path d="M12 16V4m-5 5 5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    play: <path d="m8 5 12 7-12 7V5Z" />,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    logOut: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
    mute: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m16 9 5 6m0-6-5 6" /></>,
    music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7-.2.1a8 8 0 0 1-1.5.9l-.2.1-.3 1.8h-2.8l-.3-1.8-.2-.1a8 8 0 0 1-1.5-.9l-.2-.1-1.7.7-1.4-2.4 1.4-1.1.1-.2a7 7 0 0 1 0-1.8l-.1-.2-1.4-1.1 1.4-2.4 1.7.7.2-.1a8 8 0 0 1 1.5-.9l.2-.1.3-1.8h2.8l.3 1.8.2.1a8 8 0 0 1 1.5.9l.2.1 1.7-.7 1.4 2.4-1.4 1.1-.1.2a7 7 0 0 1 0 1.8Z" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.spark}</svg>;
}

function initials(name = 'you') {
  return name.trim().slice(0, 1).toUpperCase();
}

function UserAvatar({ user, className = 'avatar' }) {
  const photo = assetUrl(user?.profilePicture);
  return <span className={`user-avatar ${className}`} aria-label={user?.username ? `${user.username}'s profile photo` : 'Profile'}>
    {photo ? <img src={photo} alt="" /> : user?.username ? initials(user.username) : <Icon name="user" />}
  </span>;
}

function SplashScreen() {
  return <main className="splash-screen" aria-label="Opening Scroll">
    <span className="splash-wordmark">scroll<span>.</span></span>
    <span className="splash-orbit splash-orbit-one" />
    <span className="splash-orbit splash-orbit-two" />
    <span className="splash-progress" />
  </main>;
}

function formatCount(value = 0) {
  return new Intl.NumberFormat('en', { notation: Number(value) >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function ProfilePage({ user, profile, loading, photoBusy, videoMutedByDefault, onClose, onUploadPhoto, onSaveProfile, onSignOut, onVideoMutedChange }) {
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ username: user?.username || '', age: user?.age || '' });
  const profileUser = profile || user || {};
  const posts = profileUser.posts || [];
  const stats = [
    { label: 'Posts', value: profileUser.postsCount ?? posts.length },
    { label: 'Followers', value: profileUser.followersCount ?? 0 },
    { label: 'Following', value: profileUser.followingCount ?? 0 },
    { label: 'Views', value: profileUser.totalViews ?? 0 },
    { label: 'Likes', value: profileUser.totalLikes ?? 0 },
  ];

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (await onSaveProfile({ username: draft.username.trim(), age: Number(draft.age) })) setEditing(false);
    } finally { setSaving(false); }
  }

  return <div className="profile-page">
    <main className="profile-page-inner">
      <header className="profile-page-topbar">
        <button className="profile-back" onClick={onClose}><Icon name="arrow" size={19} /> Back to feed</button>
        <h1>Your profile</h1>
        <div className="profile-topbar-actions">
          <button className={`profile-settings-toggle ${settingsOpen ? 'is-active' : ''}`} onClick={() => setSettingsOpen((value) => !value)} aria-label={settingsOpen ? 'Close settings' : 'Open settings'} aria-expanded={settingsOpen} title="Settings"><Icon name={settingsOpen ? 'close' : 'settings'} size={19} /></button>
          <button className="profile-logout" onClick={onSignOut}><Icon name="logOut" size={18} /><span>Sign out</span></button>
        </div>
      </header>

      {settingsOpen && <section className="profile-settings" aria-label="Settings">
        <div className="profile-settings-heading"><div><span className="eyebrow">PREFERENCES</span><h2>Settings</h2></div><p>Make Scroll feel right for you.</p></div>
        <div className="setting-row"><span><strong>Mute videos by default</strong><small>Choose whether new videos start quietly. You can change sound on any video.</small></span><button className={`setting-switch ${videoMutedByDefault ? 'is-on' : ''}`} type="button" role="switch" aria-checked={videoMutedByDefault} onClick={() => onVideoMutedChange(!videoMutedByDefault)}><span /></button></div>
      </section>}

      <section className="profile-hero">
        <label className={`profile-photo-control ${photoBusy ? 'is-busy' : ''}`}>
          <UserAvatar user={profileUser} className="profile-photo-large" />
          <span>{photoBusy ? 'Updating…' : 'Change photo'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={photoBusy} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUploadPhoto(file); event.target.value = ''; }} />
        </label>
        <div className="profile-intro">
          <span className="eyebrow">YOUR SPACE</span>
          <h2>{profileUser.username || 'Your profile'}</h2>
          <p>Member since {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'today'}</p>
          <button className="button button-light profile-edit-toggle" onClick={() => setEditing((value) => !value)}>{editing ? 'Cancel edit' : 'Edit profile'}</button>
        </div>
      </section>

      <section className="profile-stats" aria-label="Profile statistics">
        {stats.map((stat) => <div className="profile-stat" key={stat.label}><strong>{formatCount(stat.value)}</strong><span>{stat.label}</span></div>)}
      </section>

      {editing && <form className="profile-edit-form" onSubmit={saveProfile}>
        <label>Username<input value={draft.username} required minLength={1} maxLength={30} onChange={(event) => setDraft((value) => ({ ...value, username: event.target.value }))} /></label>
        <label>Age<input type="number" min="13" max="120" step="1" value={draft.age} required onChange={(event) => setDraft((value) => ({ ...value, age: event.target.value }))} /></label>
        <button className="button button-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
      </form>}

      <section className="profile-posts">
        <header><div><span className="eyebrow">YOUR MOMENTS</span><h2>Posts</h2></div><span>{formatCount(profileUser.postsCount ?? posts.length)} total</span></header>
        {loading ? <div className="profile-loading">Loading your profile…</div> : posts.length ? <div className="profile-post-grid">{posts.map((post) => {
          const media = post.media?.[0];
          return <article className="profile-post-tile" key={post._id}>
            {media?.type === 'image' ? <img src={assetUrl(media.url)} alt="" loading="lazy" /> : media?.type === 'video' ? <video src={assetUrl(media.url)} muted playsInline preload="metadata" /> : <div className="profile-post-art"><Icon name="spark" /><p>{post.content}</p></div>}
          </article>;
        })}</div> : <div className="profile-empty"><Icon name="spark" size={24} /><strong>Your first post will live here.</strong><span>Share a moment from your feed to start your profile.</span></div>}
      </section>
    </main>
  </div>;
}

function formatTime(date) {
  const time = new Date(date || Date.now()).getTime();
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

function AuthModal({ mode, setMode, onClose, onSuccess, standalone = false }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', age: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const session = signup
        ? await registerUser(form.username.trim(), form.email.trim(), form.password, form.age)
        : await loginUser(form.email.trim(), form.password);
      onSuccess(session);
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={standalone ? 'auth-page' : 'modal-scrim'} onMouseDown={(event) => !standalone && event.target === event.currentTarget && onClose()}>
      <section className={`auth-card ${standalone ? 'auth-card-page' : ''}`} role="dialog" aria-modal="true" aria-labelledby="auth-heading">
        {!standalone && <button className="icon-button auth-close" type="button" onClick={onClose} aria-label="Close"><Icon name="close" /></button>}
        <span className="eyebrow">A little more you</span>
        <h2 id="auth-heading">{signup ? 'Find your people.' : 'Good to see you.'}</h2>
        <p className="auth-intro">{signup ? 'Make a little space for what inspires you.' : 'Pick up right where your people left off.'}</p>
        <form className="auth-form" onSubmit={submit}>
          {signup && <>
            <label>Your name<input autoComplete="username" required minLength={1} maxLength={30} placeholder="e.g. alexcreates" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
            <label>Your age<input type="number" min="13" max="120" step="1" required placeholder="13+" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label>
          </>}
          <label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label>Password<input type="password" autoComplete={signup ? 'new-password' : 'current-password'} required minLength={6} placeholder="At least 6 characters" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'One moment…' : signup ? 'Create account' : 'Sign in'}<Icon name="arrow" size={17} /></button>
        </form>
        <p className="auth-switch">{signup ? 'Already part of Scroll?' : 'New around here?'} <button type="button" onClick={() => { setMode(signup ? 'login' : 'signup'); setError(''); }}>{signup ? 'Sign in' : 'Create an account'}</button></p>
        <p className="auth-footnote">By continuing, you agree to keep this a kind corner of the internet.</p>
      </section>
    </div>
  );
}

function PostCard({ post, user, liked, saved, onLike, onSave, onComment, onShare, onFollow, onView, onDownload, following, videoMutedByDefault }) {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const [mutedOverride, setMutedOverride] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [likePulseId, setLikePulseId] = useState(0);
  const [likeBurst, setLikeBurst] = useState(null);
  const likeBurstId = useRef(0);
  const author = post.author?.username || post.author?.name || 'scroll creator';
  const media = post.media?.[0];
  const mediaUrl = assetUrl(media?.url || post.image);
  const likes = Number(post.likesCount ?? post.likes ?? 0) + (liked ? 1 : 0);
  const comments = Number(post.commentsCount ?? post.commentCount ?? 0);
  const isVideo = media?.type === 'video';
  const postId = post._id;
  const isDemo = post.demo;
  const muted = mutedOverride ?? videoMutedByDefault;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const video = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onView({ _id: postId, demo: isDemo });
        if (video) video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else if (video) {
        video.pause();
        setPlaying(false);
      }
    }, { threshold: 0.65 });
    observer.observe(card);
    return () => observer.disconnect();
  }, [isDemo, isVideo, mediaUrl, onView, postId]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else { video.pause(); setPlaying(false); }
  }

  function showLikeBurst(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    likeBurstId.current += 1;
    setLikeBurst({
      id: likeBurstId.current,
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  function handleDoubleTap(event) {
    if (event.target.closest('button, a, input, label')) return;
    showLikeBurst(event);
    if (!liked) onLike(post);
  }

  function handleLike() {
    setLikePulseId((pulseId) => pulseId + 1);
    onLike(post);
  }

  return (
    <article ref={cardRef} className="post-card" id={post._id}>
      <div className="post-media-wrap" onDoubleClick={handleDoubleTap}>
        {mediaUrl ? (isVideo
          ? <video ref={videoRef} className="post-media" src={mediaUrl} muted={muted} loop autoPlay playsInline preload="metadata" onClick={togglePlayback} aria-label={`Short video by ${author}`} />
          : <img className="post-media" src={mediaUrl} alt={`A post shared by ${author}`} loading="lazy" />)
          : <div className={`post-art post-art-${(String(post._id).length % 3) + 1}`}><span className="art-kicker">A thought worth keeping</span><p>{post.content}</p><span className="art-spark">✳</span></div>}
        <div className="post-shade" />
        {likeBurst && <span key={likeBurst.id} className="like-burst" aria-hidden="true" style={{ left: `${likeBurst.x}%`, top: `${likeBurst.y}%` }}><Icon name="heart" size={90} /><i>♥</i></span>}
        <header className="post-head">
          <div className={`avatar avatar-${(author.length % 4) + 1}`}>{initials(author)}</div>
          <div className="post-author"><strong>@{author}</strong><span>{formatTime(post.createdAt)} ago · <span className="globe">Public</span></span></div>
          {user?.username !== author && <button className={`follow-button ${following ? 'is-following' : ''}`} onClick={() => onFollow(post)}>{following ? <><Icon name="check" size={14} /> Following</> : 'Follow'}</button>}
          <button className="icon-button post-more" aria-label="More post options" onClick={() => onShare(post)}><Icon name="more" /></button>
        </header>
        {isVideo && <button className={`video-playback ${playing ? 'is-playing' : ''}`} onClick={togglePlayback} aria-label={playing ? 'Pause video' : 'Play video'}><Icon name="play" size={27} /></button>}
        <div className="post-caption"><p>{post.content || 'A moment worth sharing.'}</p><span className="post-sound"><Icon name={isVideo ? 'music' : 'image'} size={14} /> {isVideo ? 'Original sound' : 'Photo'} · {author}</span></div>
        <div className="post-actions" aria-label="Short video actions">
          <button className={`short-action ${liked ? 'action-liked' : ''}`} onClick={handleLike} aria-label={liked ? 'Unlike post' : 'Like post'} aria-pressed={liked}><span key={likePulseId} className={`like-action-icon ${likePulseId ? 'is-animated' : ''}`}><Icon name="heart" size={25} /></span><span>{likes ? likes > 999 ? `${(likes / 1000).toFixed(1)}K` : likes : 'Like'}</span></button>
          <button className="short-action" onClick={() => onComment(post)} aria-label="View comments"><Icon name="comment" size={24} /><span>{comments > 999 ? `${(comments / 1000).toFixed(1)}K` : comments || 'Comment'}</span></button>
          <button className="short-action" onClick={() => onShare(post)} aria-label="Share post"><Icon name="share" size={24} /><span>Share</span></button>
          <button className={`short-action ${saved ? 'action-saved' : ''}`} onClick={() => onSave(post)} aria-label={saved ? 'Remove from saved' : 'Save post'} aria-pressed={saved}><Icon name="bookmark" size={23} /><span>{saved ? 'Saved' : 'Save'}</span></button>
          {isVideo && <><button className="short-action sound-action" onClick={() => { const nextMuted = !muted; setMutedOverride(nextMuted); if (videoRef.current) videoRef.current.muted = nextMuted; }} aria-label={muted ? 'Unmute video' : 'Mute video'}><Icon name={muted ? 'mute' : 'volume'} size={21} /><span>{muted ? 'Sound off' : 'Sound on'}</span></button><button className="short-action download-action" onClick={() => onDownload(post)} aria-label="Download video"><Icon name="download" size={22} /><span>Download</span></button></>}
        </div>
      </div>
    </article>
  );
}
function RightRail({ onCreate, onAuth, signedIn, apiOnline, user }) {
  const trends = [
    { category: 'Photography · 2.4k posts', title: 'Little things, lately', tag: '#littlethings' },
    { category: 'Travel · 1.8k posts', title: 'Somewhere slow', tag: '#slowtravel' },
    { category: 'Art · 940 posts', title: 'Made by hand', tag: '#madebyhand' },
  ];
  return <aside className="right-rail">
    <section className="welcome-card"><span className="welcome-spark"><Icon name="spark" size={19} /></span><span className="eyebrow">A fresh little feed</span><h2>Good things find their way here.</h2><p>Follow the people and ideas that make your day feel a bit brighter.</p>{signedIn ? <button className="text-link" onClick={onCreate}>Share a little something <Icon name="arrow" size={15} /></button> : <button className="button button-primary rail-join" onClick={onAuth}>Join the conversation <Icon name="arrow" size={15} /></button>}<span className="welcome-orbit orbit-one" /><span className="welcome-orbit orbit-two" /></section>
    <section className="rail-section trend-section"><div className="rail-heading"><h3>Little things trending</h3><span className="live-indicator"><i /> today</span></div>{trends.map((trend) => <button className="trend-row" key={trend.tag} onClick={() => document.querySelector('.search-input')?.focus()}><span className="trend-art"><Icon name="spark" size={17} /></span><span><small>{trend.category}</small><strong>{trend.title}</strong><em>{trend.tag}</em></span><Icon name="arrow" size={15} /></button>)}</section>
    <section className="creator-callout"><div className="creator-avatars"><span className="avatar avatar-1">N</span><span className="avatar avatar-2">S</span><span className="avatar avatar-3">E</span></div><p>Good stories are better together.</p><span>{apiOnline ? 'Your community is just a follow away.' : 'Take a look around in preview mode.'}</span></section>
    <footer className="site-footer"><span>About</span><span>Guidelines</span><span>Privacy</span><span>© Scroll 2026</span>{signedIn && user?.email && <button onClick={onCreate}>Create a post</button>}</footer>
  </aside>;
}

function CommentSheet({ post, onClose, token, showToast }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getComments(post._id, token).then((result) => { if (active) setComments(result.comments || []); }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [post._id, token]);
  async function submit(event) {
    event.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      if (post.demo) {
        setComments((items) => [...items, { _id: `local-${Date.now()}`, author: { username: 'you' }, content: message.trim() }]);
      } else {
        const result = await apiRequest(`/posts/${post._id}/comments`, { method: 'POST', token, body: { content: message.trim() } });
        setComments((items) => [...items, result.comment]);
      }
      setMessage('');
    } catch (error) { showToast(error.message); }
    finally { setSending(false); }
  }
  return <div className="modal-scrim sheet-scrim" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="comment-sheet" role="dialog" aria-modal="true" aria-labelledby="comments-heading"><header><div><span className="eyebrow">The good part</span><h2 id="comments-heading">Comments <span>{comments.length}</span></h2></div><button className="icon-button" onClick={onClose} aria-label="Close comments"><Icon name="close" /></button></header><div className="comment-list">{loading ? <div className="comment-empty">Finding the conversation…</div> : comments.length ? comments.map((comment) => <div className="comment-item" key={comment._id}><div className="avatar avatar-2">{initials(comment.author?.username)}</div><div><strong>{comment.author?.username || 'someone'}</strong><p>{comment.content}</p></div></div>) : <div className="comment-empty"><span>☁</span><strong>A little quiet here.</strong><p>Be the first to say something kind.</p></div>}</div><form className="comment-form" onSubmit={submit}><div className="avatar avatar-1">Y</div><input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} placeholder="Add something kind…" aria-label="Write a comment" /><button disabled={!message.trim() || sending} aria-label="Send comment"><Icon name="send" size={19} /></button></form></section></div>;
}

function App() {
  const storedIds = (key) => {
    try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
    catch { return new Set(); }
  };
  const [token, setToken] = useState(() => localStorage.getItem('scroll_token') || '');
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('scroll_user') || 'null'); } catch { return null; } });
  const [posts, setPosts] = useState([]);
  const [likedIds, setLikedIds] = useState(() => storedIds('scroll_likes'));
  const [savedIds, setSavedIds] = useState(() => storedIds('scroll_saves'));
  const [followingIds, setFollowingIds] = useState(new Set());
  const [activeNav, setActiveNav] = useState('for-you');
  const [tab, setTab] = useState('For you');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [composeFiles, setComposeFiles] = useState([]);
  const [commentPost, setCommentPost] = useState(null);
  const [toast, setToast] = useState('');
  const [posting, setPosting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [appStage, setAppStage] = useState('splash');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [videoMutedByDefault, setVideoMutedByDefault] = useState(() => localStorage.getItem('scroll_video_muted') !== 'false');

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      const storedToken = localStorage.getItem('scroll_token') || '';
      let storedUser = null;
      try { storedUser = JSON.parse(localStorage.getItem('scroll_user') || 'null'); } catch { /* Recover below. */ }
      if (!storedToken) {
        if (active) setAppStage('auth');
        return;
      }
      try {
        const result = await apiRequest('/profile/me', { token: storedToken });
        if (!active) return;
        const verifiedUser = result.user || storedUser;
        setToken(storedToken);
        setUser(verifiedUser);
        if (verifiedUser) localStorage.setItem('scroll_user', JSON.stringify(verifiedUser));
        setAppStage(verifiedUser ? 'feed' : 'auth');
      } catch (error) {
        if (!active) return;
        if (error.status === 401 || error.status === 403 || !storedUser) {
          localStorage.removeItem('scroll_token');
          localStorage.removeItem('scroll_user');
          setToken('');
          setUser(null);
          setAppStage('auth');
        } else {
          setToken(storedToken);
          setUser(storedUser);
          setAppStage('feed');
        }
      }
    }, 1150);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const result = token && activeNav === 'following'
        ? await getFeed(token)
        : token && activeNav === 'saved'
          ? await apiRequest('/bookmarks?limit=20', { token })
          : await getPosts();
      const resultPosts = activeNav === 'saved'
        ? (result.bookmarks || []).map((bookmark) => bookmark.post).filter(Boolean)
        : result.posts || [];
      if (token && activeNav === 'saved') {
        setSavedIds((current) => new Set([...current, ...resultPosts.map((post) => post._id)]));
      }
      setPosts(resultPosts);
      setApiOnline(true);
    } catch {
      setPosts(demoPosts);
      setApiOnline(false);
    } finally { setLoading(false); }
  }, [token, activeNav]);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setProfileLoading(true);
    try {
      const result = await apiRequest('/profile/me', { token });
      const nextProfile = result.profile || result.user;
      setProfileData(nextProfile || null);
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('scroll_user', JSON.stringify(result.user));
      }
    } catch (error) { showToast(error.message || 'Could not load your profile.'); }
    finally { setProfileLoading(false); }
  }, [token, showToast]);

  const recordView = useCallback((post) => {
    if (post.demo || !post._id || sessionStorage.getItem(`scroll_viewed_${post._id}`)) return;
    sessionStorage.setItem(`scroll_viewed_${post._id}`, '1');
    recordPostView(post._id).catch(() => {});
  }, []);

  function openProfile() {
    if (!token) { openAuth('login'); return; }
    setProfileOpen(true);
    loadProfile();
  }

  async function saveProfile(changes) {
    try {
      const result = await updateMyProfile(changes, token);
      const updatedUser = result.user;
      setUser(updatedUser);
      setProfileData((current) => ({ ...current, ...updatedUser }));
      localStorage.setItem('scroll_user', JSON.stringify(updatedUser));
      showToast('Your profile is up to date.');
      return true;
    } catch (error) { showToast(error.message || 'Could not save your profile.'); return false; }
  }

  async function changeProfilePicture(file) {
    if (!file.type.startsWith('image/')) { showToast('Choose an image for your profile photo.'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Choose a photo smaller than 5 MB.'); return; }
    setPhotoBusy(true);
    try {
      const result = await uploadProfilePicture(file, token);
      const updatedUser = result.user;
      setUser(updatedUser);
      setProfileData((current) => ({ ...current, ...updatedUser }));
      localStorage.setItem('scroll_user', JSON.stringify(updatedUser));
      showToast('Profile photo updated.');
    } catch (error) { showToast(error.message || 'Could not update your profile photo.'); }
    finally { setPhotoBusy(false); }
  }

  function changeVideoMutedDefault(muted) {
    setVideoMutedByDefault(muted);
    localStorage.setItem('scroll_video_muted', String(muted));
  }

  useEffect(() => {
    const timer = window.setTimeout(loadPosts, 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  useEffect(() => {
    if (!search.trim()) return undefined;
    const query = search.trim();
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const result = await apiRequest(`/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        setSearchResults({ ...(result.results || { users: [], posts: [] }), query });
      } catch { setSearchResults({ users: [], posts: [], preview: true, query }); }
    }, 350);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [search]);

  const visiblePosts = useMemo(() => {
    let list = posts;
    if (activeNav === 'saved' && !token) list = list.filter((post) => savedIds.has(post._id));
    if (activeNav === 'following') list = token ? list : list.filter((post) => followingIds.has(post.author?._id || post.author?.username));
    if (activeNav === 'explore' && list.every((post) => post.demo)) list = [...list].reverse();
    if (search.trim() && searchResults?.query === search.trim()) list = searchResults.posts?.length ? searchResults.posts : [];
    else if (search.trim()) list = list.filter((post) => `${post.content || ''} ${post.author?.username || ''}`.toLowerCase().includes(search.trim().toLowerCase()));
    return list;
  }, [posts, activeNav, savedIds, followingIds, token, search, searchResults]);

  function openAuth(mode = 'login') { setAuthMode(mode); setAuthOpen(true); }
  function handleAuthSuccess(session) {
    setToken(session.token);
    setUser(session.user);
    localStorage.setItem('scroll_token', session.token);
    localStorage.setItem('scroll_user', JSON.stringify(session.user));
    setAppStage('feed');
    setAuthOpen(false);
    showToast(`Welcome in, ${session.user?.username || 'friend'} ✨`);
    loadPosts();
  }
  function signOut() {
    localStorage.removeItem('scroll_token');
    localStorage.removeItem('scroll_user');
    setToken(''); setUser(null); setActiveNav('for-you'); setTab('For you'); setProfileOpen(false); setProfileData(null); setAppStage('auth'); setAuthMode('login');
    showToast('You’ve signed out. See you soon!');
  }
  function selectNav(item) {
    if (['saved', 'following'].includes(item.id) && !token && apiOnline) { openAuth(); return; }
    setActiveNav(item.id);
    setTab(item.id === 'following' ? 'Following' : 'For you');
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function toggleLike(post) {
    if (apiOnline && !token) { openAuth(); return; }
    const wasLiked = likedIds.has(post._id);
    const next = new Set(likedIds);
    wasLiked ? next.delete(post._id) : next.add(post._id);
    setLikedIds(next);
    localStorage.setItem('scroll_likes', JSON.stringify([...next]));
    if (!post.demo && token) {
      try { await apiRequest(`/likes/${post._id}`, { method: wasLiked ? 'DELETE' : 'POST', token }); }
      catch (error) { showToast(error.message); }
    }
  }
  async function toggleSave(post) {
    if (apiOnline && !token) { openAuth(); return; }
    const wasSaved = savedIds.has(post._id);
    const next = new Set(savedIds);
    wasSaved ? next.delete(post._id) : next.add(post._id);
    setSavedIds(next);
    localStorage.setItem('scroll_saves', JSON.stringify([...next]));
    if (!post.demo && token) {
      try { await apiRequest(`/bookmarks/${post._id}`, { method: wasSaved ? 'DELETE' : 'POST', token }); }
      catch (error) { showToast(error.message); }
    }
    showToast(wasSaved ? 'Removed from your saved posts.' : 'Saved for a quieter moment.');
  }
  async function toggleFollow(post) {
    const authorId = post.author?._id;
    if (!token && apiOnline) { openAuth(); return; }
    if (!authorId || post.demo) {
      const key = post.author?.username || post._id;
      setFollowingIds((current) => { const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next; });
      showToast('Following saved for this preview.');
      return;
    }
    const isFollowing = followingIds.has(authorId);
    const next = new Set(followingIds); isFollowing ? next.delete(authorId) : next.add(authorId); setFollowingIds(next);
    try { await apiRequest(`/follows/${authorId}`, { method: isFollowing ? 'DELETE' : 'POST', token }); }
    catch (error) { showToast(error.message); setFollowingIds(followingIds); }
  }
  async function submitPost(event) {
    event.preventDefault();
    if (!composeText.trim() && composeFiles.length === 0) return;
    setPosting(true);
    try {
      if (apiOnline && token) {
        const result = await createPost(composeText, composeFiles, token);
        setPosts((current) => [result.post, ...current]);
      } else {
        const localMedia = composeFiles.map((file) => ({ type: file.type.startsWith('video/') ? 'video' : 'image', url: URL.createObjectURL(file) }));
        setPosts((current) => [{ _id: `local-${Date.now()}`, demo: true, author: { username: user?.username || 'you' }, content: composeText.trim(), media: localMedia, createdAt: new Date().toISOString() }, ...current]);
        showToast('Your post is in this preview. Connect the API to share it with everyone.');
      }
      setComposeText(''); setComposeFiles([]); setComposerOpen(false);
    } catch (error) { showToast(error.message); }
    finally { setPosting(false); }
  }
  async function sharePost(post) {
    const url = `${window.location.origin}${window.location.pathname}#${post._id}`;
    try {
      if (navigator.share) await navigator.share({ title: 'A little something on Scroll', text: post.content, url });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); showToast('Post link copied to your clipboard.'); }
      else showToast('Share this post with someone you like.');
    } catch (error) { if (error.name !== 'AbortError') showToast('This post is ready to share.'); }
  }
  async function downloadVideo(post) {
    const video = post.media?.find((item) => item.type === 'video');
    const url = assetUrl(video?.url || post.image);
    if (!url) { showToast('There is no video to download.'); return; }
    const username = (post.author?.username || 'scroll-video').replace(/[^a-z0-9_-]/gi, '-').slice(0, 32);
    const originalName = new URL(url, window.location.href).pathname.split('/').pop() || '';
    const extension = originalName.match(/\.[a-z0-9]{2,5}$/i)?.[0] || '.mp4';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('The video could not be downloaded.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${username}-scroll-${post._id}${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
      showToast('Your video download has started.');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('Opening the video so you can save it.');
    }
  }
  async function submitSearch(event) {
    event.preventDefault();
    if (!search.trim()) return;
    setSearching(true); setActiveNav('explore');
    try {
      const result = await apiRequest(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearchResults({ ...(result.results || { users: [], posts: [] }), query: search.trim() });
    } catch { setSearchResults({ users: [], posts: [], preview: true, query: search.trim() }); }
    finally { setSearching(false); }
    setSearchOpen(false);
  }

  const currentTitle = activeNav === 'saved' ? 'Saved Shorts' : activeNav === 'following' ? 'Following' : activeNav === 'explore' ? 'Explore Shorts' : 'For You';

  if (appStage === 'splash') return <SplashScreen />;
  if (appStage === 'auth') return <AuthModal mode={authMode} setMode={setAuthMode} onSuccess={handleAuthSuccess} standalone />;

  return <div className={`scroll-app ${profileOpen ? 'profile-active' : ''}`}>
    <aside className="left-rail">
      <div className="left-label">YOUR SPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={`nav-item ${activeNav === item.id ? 'nav-active' : ''}`} onClick={() => selectNav(item)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'saved' && savedIds.size > 0 && <span className="nav-count">{savedIds.size}</span>}</button>)}<button className={`nav-item ${activeNav === 'notifications' ? 'nav-active' : ''}`} onClick={() => { setActiveNav('notifications'); showToast(token ? 'You’re all caught up.' : 'Sign in to keep up with your people.'); if (!token && apiOnline) openAuth(); }}><Icon name="bell" /><span>Notifications</span><span className="notification-dot" /></button></nav>
      <button className="create-button" onClick={() => { if (apiOnline && !token) openAuth('signup'); else setComposerOpen(true); }}><Icon name="plus" size={19} /><span>Share a moment</span></button>
      <section className="rail-prompt"><span className="prompt-icon"><Icon name="spark" size={18} /></span><strong>A little reminder</strong><p>Make room for the things that make you feel like you.</p><span className="prompt-decoration">✳</span></section>
      <div className="left-bottom"><button className="profile-row" onClick={openProfile}><UserAvatar user={user} /><span className="profile-meta"><strong>{user?.username}</strong><small>View your profile</small></span><Icon name="arrow" size={17} /></button><span className="left-copyright">A softer corner of the internet. © 2026</span></div>
    </aside>

    <main className="main-column">
      <div className="topbar"><div className="breadcrumb"><span>Home</span><span>/</span><strong>{navItems.find((item) => item.id === activeNav)?.label || 'Notifications'}</strong></div><div className="topbar-actions"><button className="search-toggle" onClick={() => setSearchOpen(true)} aria-label="Search Scroll"><Icon name="search" size={24} /></button></div></div>

      <section className="feed-heading"><div><span className="eyebrow"><span className="sun-dot" /> SHORT VIDEOS · GOOD STORIES</span><h1>{currentTitle}<span className="heading-period">.</span></h1><p>Swipe through something new. Stay for what moves you.</p></div><button className="new-post-button" aria-label="Create a Short" onClick={() => { if (apiOnline && !token) openAuth('signup'); else setComposerOpen(true); }}><Icon name="plus" size={17} /> <span>Create</span></button></section>

      <div className="feed-toolbar"><div className="feed-tabs"><button className={tab === 'For you' ? 'feed-tab-active' : ''} onClick={() => { setTab('For you'); setActiveNav('for-you'); }}><Icon name="spark" size={15} /> For You</button><button className={tab === 'Following' ? 'feed-tab-active' : ''} onClick={() => { setTab('Following'); setActiveNav('following'); }}><Icon name="users" size={16} /> Following</button></div><span className={`connection-label ${apiOnline ? 'connected' : ''}`}><i />{apiOnline ? 'Community feed' : 'Preview mode'}</span></div>

      {search && <div className="search-results-panel"><div className="search-result-head"><div><span className="eyebrow">LOOKING FOR</span><h2>“{search}”</h2></div><button className="icon-button" onClick={() => { setSearch(''); setSearchResults(null); }} aria-label="Clear search"><Icon name="close" /></button></div>{searching && <p className="search-placeholder">Finding a few good things…</p>}{searchResults && !searching && (searchResults.posts?.length || searchResults.users?.length ? <><div className="search-result-tags">{searchResults.users?.length ? <span>{searchResults.users.length} people</span> : null}{searchResults.posts?.length ? <span>{searchResults.posts.length} posts</span> : null}</div>{searchResults.users?.map((person) => <div className="search-person" key={person._id}><div className="avatar avatar-2">{initials(person.username)}</div><strong>{person.username}</strong><span>on Scroll</span></div>)}</> : <div className="search-placeholder"><span>☁</span><strong>No matches just yet.</strong><p>{searchResults.preview ? 'Connect the Scroll API to search the wider community.' : 'Try another word or explore the feed below.'}</p></div>)}</div>}

      {!search && <>
        {activeNav === 'notifications' ? <section className="empty-state"><span className="empty-illustration"><Icon name="bell" size={31} /></span><span className="eyebrow">A quiet moment</span><h2>You’re all caught up.</h2><p>When someone likes or comments on something you share, you’ll find it right here.</p><button className="button button-light" onClick={() => selectNav(navItems[0])}>Back to your feed</button></section> : loading ? <div className="loading-state"><span className="loader" /><p>Gathering the good stuff…</p></div> : visiblePosts.length ? <div className="post-list">{visiblePosts.map((post) => <PostCard key={post._id} post={post} user={user} liked={likedIds.has(post._id)} saved={savedIds.has(post._id)} following={followingIds.has(post.author?._id || post.author?.username)} onLike={toggleLike} onSave={toggleSave} onComment={(item) => setCommentPost(item)} onShare={sharePost} onFollow={toggleFollow} onView={recordView} onDownload={downloadVideo} videoMutedByDefault={videoMutedByDefault} />)}</div> : <div className="empty-state"><span className="empty-illustration"><Icon name={activeNav === 'saved' ? 'bookmark' : 'spark'} size={31} /></span><span className="eyebrow">A fresh start</span><h2>{activeNav === 'saved' ? 'Nothing tucked away yet.' : activeNav === 'following' ? 'Your circle is waiting.' : 'It’s a little quiet here.'}</h2><p>{activeNav === 'saved' ? 'Save a post that speaks to you and it will be right here.' : activeNav === 'following' ? 'Find a creator whose corner of the world you love and follow along.' : 'There is always a first story. Share yours or come back in a little while.'}</p><button className="button button-primary" onClick={() => activeNav === 'following' ? setActiveNav('explore') : setComposerOpen(true)}>{activeNav === 'following' ? 'Explore the community' : 'Share a little something'} <Icon name="arrow" size={16} /></button></div>}
        {!loading && activeNav !== 'notifications' && visiblePosts.length > 0 && <div className="feed-end"><span>✳</span><p>You’re all caught up for now.</p><small>Take a breath. The good stuff will still be here.</small></div>}
      </>}
      <div className="mobile-nav">{[...navItems.slice(0, 3), { id: 'create', label: 'Create', icon: 'plus' }, { id: 'profile', label: 'Profile', icon: 'user' }].map((item) => item.id === 'create' ? <button key="create" onClick={() => setComposerOpen(true)}><Icon name="plus" size={20} /><small>Create</small></button> : item.id === 'profile' ? <button key="profile" onClick={openProfile}><Icon name="user" size={19} /><small>Profile</small></button> : <button key={item.id} className={activeNav === item.id ? 'mobile-active' : ''} onClick={() => selectNav(item)}><Icon name={item.icon} size={19} /><small>{item.label}</small></button>)}</div>
    </main>

    <RightRail onCreate={() => setComposerOpen(true)} onAuth={() => openAuth('signup')} signedIn={Boolean(user)} apiOnline={apiOnline} user={user} />

    {profileOpen && <ProfilePage user={user} profile={profileData} loading={profileLoading} photoBusy={photoBusy} videoMutedByDefault={videoMutedByDefault} onVideoMutedChange={changeVideoMutedDefault} onClose={() => setProfileOpen(false)} onUploadPhoto={changeProfilePicture} onSaveProfile={saveProfile} onSignOut={signOut} />}
    {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />}
    {searchOpen && <div className="search-scrim" onMouseDown={(event) => event.target === event.currentTarget && setSearchOpen(false)}><form className="search-dialog" onSubmit={submitSearch}><div className="search-dialog-field"><Icon name="search" size={22} /><input className="search-input" autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people and posts" aria-label="Search Scroll" /><button type="button" className="icon-button" onClick={() => { setSearch(''); setSearchResults(null); setSearchOpen(false); }} aria-label="Close search"><Icon name="close" /></button></div><p>Look for a creator or a moment you want to find again.</p>{searching && <span className="search-dialog-hint">Searching…</span>}<button className="button button-primary search-submit" disabled={!search.trim() || searching}>Search <Icon name="arrow" size={16} /></button></form></div>}
    {commentPost && <CommentSheet post={commentPost} token={token} onClose={() => setCommentPost(null)} showToast={showToast} />}
    {composerOpen && <div className="modal-scrim" onMouseDown={(event) => event.target === event.currentTarget && setComposerOpen(false)}><section className="composer-card" role="dialog" aria-modal="true" aria-labelledby="compose-heading"><header><div><span className="eyebrow">A little something from you</span><h2 id="compose-heading">Share a moment</h2></div><button className="icon-button" aria-label="Close composer" onClick={() => setComposerOpen(false)}><Icon name="close" /></button></header><form onSubmit={submitPost}><textarea value={composeText} onChange={(event) => setComposeText(event.target.value)} maxLength={5000} placeholder="What’s making your day a little brighter?" aria-label="Post text" autoFocus /><div className="composer-bottom"><label className="attach-button"><Icon name="image" size={18} /><span>Add photos or video</span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" multiple onChange={(event) => setComposeFiles([...event.target.files].slice(0, 5))} /></label><small>{composeText.length}/5000</small></div>{composeFiles.length > 0 && <div className="file-pills">{composeFiles.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}</div>}<button className="button button-primary compose-submit" disabled={posting || (!composeText.trim() && composeFiles.length === 0)}>{posting ? 'Sharing…' : 'Share with everyone'} <Icon name="arrow" size={16} /></button><p className="compose-note">{apiOnline && token ? 'Your post will be shared with the community.' : 'This preview saves your post to this session only.'}</p></form></section></div>}
    {toast && <div className="toast" role="status"><Icon name="spark" size={16} />{toast}</div>}
  </div>;
}

export default App;

