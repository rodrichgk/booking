'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, Video, Eye, EyeOff, Star, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/dashboard/confirm-dialog';
import { Modal } from '@/components/dashboard/modal';
import {
  PageHeader, PageShell, Panel, Badge, EmptyState, Spinner, btn, inputClass, labelClass,
} from '@/components/dashboard/ui';

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  priceInCents: number;
  currency: string;
  isActive: boolean | null;
  isFeatured: boolean | null;
  videoCount: number;
  createdAt: string;
}

interface CourseVideo {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  order: number | null;
  duration: number | null;
}

interface CoursesClientProps {
  initialCourses: Course[];
  locale: string;
  currentUserRole: string;
}

const translations = {
  fr: {
    title: 'Cours vidéo',
    subtitle: 'Formations payantes ou gratuites, composées de vidéos YouTube.',
    addCourse: 'Nouveau cours',
    editCourse: 'Modifier le cours',
    edit: 'Modifier',
    courseTitle: 'Titre',
    courseDescription: 'Description',
    courseThumbnail: 'Image de couverture (URL)',
    price: 'Prix',
    priceHelp: 'Laissez 0 pour un cours gratuit.',
    currency: 'Devise',
    isActive: 'Publié',
    isActiveHelp: 'Visible par les utilisateurs',
    isFeatured: 'Mis en avant',
    videos: 'vidéos',
    noVideos: 'Aucune vidéo dans ce cours',
    noVideosHelp: 'Ajoutez la première vidéo avec son lien YouTube.',
    addVideo: 'Ajouter une vidéo',
    videoTitle: 'Titre de la vidéo',
    youtube: 'Lien ou ID YouTube',
    youtubeHelp: 'Collez le lien de la vidéo, par exemple youtube.com/watch?v=...',
    youtubeInvalid: 'Lien YouTube non reconnu.',
    duration: 'Durée',
    durationHelp: 'Au format minutes:secondes, par exemple 12:30.',
    save: 'Enregistrer',
    create: 'Créer le cours',
    cancel: 'Annuler',
    confirmDelete: 'Supprimer ce cours ?',
    confirmDeleteHelp: 'Le cours et ses vidéos sont supprimés. Impossible si le cours a déjà été acheté.',
    confirmDeleteVideo: 'Supprimer cette vidéo ?',
    delete: 'Supprimer',
    noCourses: 'Aucun cours pour l’instant',
    noCoursesHelp: 'Créez un cours, puis ajoutez-y des vidéos YouTube.',
    manageVideos: 'Vidéos',
    free: 'Gratuit',
    draft: 'Brouillon',
    error: 'Une erreur est survenue',
  },
  en: {
    title: 'Video courses',
    subtitle: 'Paid or free courses made of YouTube videos.',
    addCourse: 'New course',
    editCourse: 'Edit course',
    edit: 'Edit',
    courseTitle: 'Title',
    courseDescription: 'Description',
    courseThumbnail: 'Cover image (URL)',
    price: 'Price',
    priceHelp: 'Leave 0 for a free course.',
    currency: 'Currency',
    isActive: 'Published',
    isActiveHelp: 'Visible to users',
    isFeatured: 'Featured',
    videos: 'videos',
    noVideos: 'No videos in this course',
    noVideosHelp: 'Add the first video with its YouTube link.',
    addVideo: 'Add video',
    videoTitle: 'Video title',
    youtube: 'YouTube link or ID',
    youtubeHelp: 'Paste the video link, e.g. youtube.com/watch?v=...',
    youtubeInvalid: 'YouTube link not recognised.',
    duration: 'Duration',
    durationHelp: 'As minutes:seconds, e.g. 12:30.',
    save: 'Save',
    create: 'Create course',
    cancel: 'Cancel',
    confirmDelete: 'Delete this course?',
    confirmDeleteHelp: 'The course and its videos are deleted. Not possible once the course has been purchased.',
    confirmDeleteVideo: 'Delete this video?',
    delete: 'Delete',
    noCourses: 'No courses yet',
    noCoursesHelp: 'Create a course, then add YouTube videos to it.',
    manageVideos: 'Videos',
    free: 'Free',
    draft: 'Draft',
    error: 'Something went wrong',
  },
};

/** Accepts a bare 11-char ID or any common YouTube URL shape. */
function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  const match = value.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return match ? match[1] : null;
}

const parseDuration = (value: string): number => {
  const v = value.trim();
  if (!v) return 0;
  if (v.includes(':')) {
    const [m, s] = v.split(':').map((part) => parseInt(part, 10) || 0);
    return m * 60 + s;
  }
  return (parseInt(v, 10) || 0) * 60;
};

const formatDuration = (seconds: number | null) =>
  seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : '';

const emptyCourse = { title: '', description: '', thumbnail: '', price: '0', currency: 'EUR', isActive: true, isFeatured: false };
const emptyVideo = { title: '', description: '', youtube: '', duration: '' };

export function CoursesClient({ initialCourses, locale }: CoursesClientProps) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const { toast } = useToast();
  const confirm = useConfirm();

  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [editing, setEditing] = useState<Course | 'new' | null>(null);
  const [form, setForm] = useState(emptyCourse);
  const [videosFor, setVideosFor] = useState<Course | null>(null);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoForm, setVideoForm] = useState(emptyVideo);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fail = (message?: string) => toast({ variant: 'error', title: t.error, description: message });

  const formatPrice = (cents: number, currency: string) =>
    cents === 0
      ? t.free
      : new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency }).format(cents / 100);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchVideos = async (courseId: string) => {
    setLoadingVideos(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      fail();
    } finally {
      setLoadingVideos(false);
    }
  };

  const openCourseForm = (course: Course | 'new') => {
    setForm(
      course === 'new'
        ? emptyCourse
        : {
            title: course.title,
            description: course.description || '',
            thumbnail: course.thumbnail || '',
            price: (course.priceInCents / 100).toString(),
            currency: course.currency,
            isActive: course.isActive ?? true,
            isFeatured: course.isFeatured ?? false,
          }
    );
    setEditing(course);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const { price, ...rest } = form;
    const payload = { ...rest, priceInCents: Math.round((parseFloat(price.replace(',', '.')) || 0) * 100) };
    try {
      const res = await fetch(editing === 'new' ? '/api/admin/courses' : `/api/admin/courses/${editing.id}`, {
        method: editing === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error);
      await fetchCourses();
      setEditing(null);
    } catch {
      fail();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course: Course) => {
    const ok = await confirm({ title: t.confirmDelete, description: t.confirmDeleteHelp, confirmLabel: t.delete, tone: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error);
      await fetchCourses();
    } catch {
      fail();
    }
  };

  const openVideos = (course: Course) => {
    setVideosFor(course);
    setVideos([]);
    setShowVideoForm(false);
    fetchVideos(course.id);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videosFor) return;
    const youtubeVideoId = extractYoutubeId(videoForm.youtube);
    if (!youtubeVideoId) return fail(t.youtubeInvalid);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/courses/${videosFor.id}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoForm.title,
          description: videoForm.description,
          youtubeVideoId,
          duration: parseDuration(videoForm.duration),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return fail(data.error);
      setVideoForm(emptyVideo);
      setShowVideoForm(false);
      await Promise.all([fetchVideos(videosFor.id), fetchCourses()]);
    } catch {
      fail();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!videosFor) return;
    const ok = await confirm({ title: t.confirmDeleteVideo, confirmLabel: t.delete, tone: 'danger' });
    if (!ok) return;
    try {
      const res = await fetch(`/api/admin/courses/${videosFor.id}/videos?videoId=${videoId}`, { method: 'DELETE' });
      if (!res.ok) return fail();
      await Promise.all([fetchVideos(videosFor.id), fetchCourses()]);
    } catch {
      fail();
    }
  };

  const youtubePreviewId = extractYoutubeId(videoForm.youtube);

  return (
    <>
      <PageHeader
        title={t.title}
        description={t.subtitle}
        actions={
          <button onClick={() => openCourseForm('new')} className={btn.primary}>
            <Plus className="h-4 w-4" />
            {t.addCourse}
          </button>
        }
      />

      <PageShell>
        {courses.length === 0 ? (
          <Panel>
            <EmptyState
              icon={Video}
              title={t.noCourses}
              description={t.noCoursesHelp}
              action={
                <button onClick={() => openCourseForm('new')} className={btn.primary}>
                  <Plus className="h-4 w-4" />
                  {t.addCourse}
                </button>
              }
            />
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Panel key={course.id} className="flex flex-col overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Video className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {course.isActive ? <Badge tone="success" icon={Eye}>{t.isActive}</Badge> : <Badge icon={EyeOff}>{t.draft}</Badge>}
                    {course.isFeatured && <Badge tone="brand" icon={Star}>{t.isFeatured}</Badge>}
                  </div>
                  <h3 className="font-display text-base font-semibold text-gray-900">{course.title}</h3>
                  {course.description && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{course.description}</p>}
                  <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                    <span className="tabular-nums text-gray-500">{course.videoCount} {t.videos}</span>
                    <span className="font-semibold tabular-nums text-gray-900">{formatPrice(course.priceInCents, course.currency)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 border-t border-gray-100 px-3 py-2">
                  <button onClick={() => openVideos(course)} className={`${btn.ghost} ${btn.sm}`}>
                    <PlayCircle className="h-3.5 w-3.5" />
                    {t.manageVideos}
                  </button>
                  <button onClick={() => openCourseForm(course)} className={`${btn.ghost} ${btn.sm}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    {t.edit}
                  </button>
                  <button onClick={() => handleDeleteCourse(course)} className={`${btn.iconDanger} ml-auto`} aria-label={`${t.delete} ${course.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </PageShell>

      {/* Create / edit course */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? t.addCourse : t.editCourse}
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className={btn.secondary}>{t.cancel}</button>
            <button type="submit" form="course-form" disabled={saving} className={btn.primary}>
              {saving && <Spinner className="h-3.5 w-3.5" />}
              {editing === 'new' ? t.create : t.save}
            </button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSaveCourse} className="space-y-4">
          <div>
            <label htmlFor="course-title" className={labelClass}>{t.courseTitle} <span className="text-red-600" aria-hidden="true">*</span></label>
            <input id="course-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="course-description" className={labelClass}>{t.courseDescription}</label>
            <textarea id="course-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label htmlFor="course-thumbnail" className={labelClass}>{t.courseThumbnail}</label>
            <input id="course-thumbnail" type="url" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://..." className={inputClass} />
          </div>
          <div className="grid grid-cols-[1fr_7rem] gap-4">
            <div>
              <label htmlFor="course-price" className={labelClass}>{t.price}</label>
              <input
                id="course-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                aria-describedby="course-price-help"
                className={inputClass}
              />
              <p id="course-price-help" className="mt-1.5 text-xs text-gray-500">{t.priceHelp}</p>
            </div>
            <div>
              <label htmlFor="course-currency" className={labelClass}>{t.currency}</label>
              <select id="course-currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span>
                <span className="block text-sm font-medium text-gray-900">{t.isActive}</span>
                <span className="block text-xs text-gray-500">{t.isActiveHelp}</span>
              </span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <span className="text-sm font-medium text-gray-900">{t.isFeatured}</span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Videos of a course */}
      <Modal
        open={!!videosFor}
        onClose={() => setVideosFor(null)}
        title={videosFor?.title ?? ''}
        description={`${videos.length} ${t.videos}`}
        size="lg"
      >
        <div className="space-y-4">
          {loadingVideos ? (
            <div className="flex justify-center py-8"><Spinner className="h-5 w-5 text-gray-400" /></div>
          ) : videos.length === 0 && !showVideoForm ? (
            <EmptyState icon={Video} title={t.noVideos} description={t.noVideosHelp} className="py-6" />
          ) : (
            <ol className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {[...videos].sort((a, b) => (a.order || 0) - (b.order || 0)).map((video, index) => (
                <li key={video.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 text-right text-sm tabular-nums text-gray-400">{index + 1}</span>
                  <Image
                    src={`https://i.ytimg.com/vi/${video.youtubeVideoId}/default.jpg`}
                    alt=""
                    width={64}
                    height={48}
                    unoptimized
                    className="h-12 w-16 flex-shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{video.title}</p>
                    <p className="text-xs tabular-nums text-gray-500">{formatDuration(video.duration) || video.youtubeVideoId}</p>
                  </div>
                  <button onClick={() => handleDeleteVideo(video.id)} className={btn.iconDanger} aria-label={`${t.delete} ${video.title}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ol>
          )}

          {showVideoForm ? (
            <form onSubmit={handleAddVideo} className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <label htmlFor="video-youtube" className={labelClass}>{t.youtube} <span className="text-red-600" aria-hidden="true">*</span></label>
                <input
                  id="video-youtube"
                  type="text"
                  value={videoForm.youtube}
                  onChange={(e) => setVideoForm({ ...videoForm, youtube: e.target.value })}
                  required
                  autoFocus
                  aria-describedby="video-youtube-help"
                  className={inputClass}
                />
                <p id="video-youtube-help" className={`mt-1.5 text-xs ${videoForm.youtube && !youtubePreviewId ? 'text-red-600' : 'text-gray-500'}`}>
                  {videoForm.youtube && !youtubePreviewId ? t.youtubeInvalid : t.youtubeHelp}
                </p>
              </div>
              <div className="grid grid-cols-[1fr_7rem] gap-4">
                <div>
                  <label htmlFor="video-title" className={labelClass}>{t.videoTitle} <span className="text-red-600" aria-hidden="true">*</span></label>
                  <input id="video-title" type="text" value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="video-duration" className={labelClass}>{t.duration}</label>
                  <input
                    id="video-duration"
                    type="text"
                    inputMode="numeric"
                    placeholder="12:30"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    title={t.durationHelp}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="video-description" className={labelClass}>{t.courseDescription}</label>
                <textarea id="video-description" value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowVideoForm(false); setVideoForm(emptyVideo); }} className={btn.secondary}>{t.cancel}</button>
                <button type="submit" disabled={saving || !youtubePreviewId} className={btn.primary}>
                  {saving && <Spinner className="h-3.5 w-3.5" />}
                  {t.addVideo}
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowVideoForm(true)} className={btn.secondary}>
              <Plus className="h-4 w-4" />
              {t.addVideo}
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
