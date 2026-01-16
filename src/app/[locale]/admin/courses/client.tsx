'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Pencil,
    Trash2,
    Video,
    DollarSign,
    Eye,
    EyeOff,
    Star,
    ChevronDown,
    ChevronUp,
    X,
    Save,
    ArrowLeft,
} from 'lucide-react';

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
        title: 'Gestion des Cours',
        addCourse: 'Nouveau Cours',
        editCourse: 'Modifier le Cours',
        deleteCourse: 'Supprimer',
        courseTitle: 'Titre',
        courseDescription: 'Description',
        courseThumbnail: 'URL de la miniature',
        coursePrice: 'Prix (centimes)',
        coursePriceDisplay: 'Prix',
        currency: 'Devise',
        isActive: 'Actif',
        isFeatured: 'En vedette',
        videos: 'Vidéos',
        noVideos: 'Aucune vidéo',
        addVideo: 'Ajouter une vidéo',
        videoTitle: 'Titre de la vidéo',
        youtubeId: 'ID YouTube',
        duration: 'Durée (secondes)',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce cours ?',
        confirmDeleteVideo: 'Êtes-vous sûr de vouloir supprimer cette vidéo ?',
        noCourses: 'Aucun cours trouvé',
        createFirstCourse: 'Créer votre premier cours',
        manageVideos: 'Gérer les vidéos',
        back: 'Retour',
        free: 'Gratuit',
    },
    en: {
        title: 'Course Management',
        addCourse: 'New Course',
        editCourse: 'Edit Course',
        deleteCourse: 'Delete',
        courseTitle: 'Title',
        courseDescription: 'Description',
        courseThumbnail: 'Thumbnail URL',
        coursePrice: 'Price (cents)',
        coursePriceDisplay: 'Price',
        currency: 'Currency',
        isActive: 'Active',
        isFeatured: 'Featured',
        videos: 'Videos',
        noVideos: 'No videos',
        addVideo: 'Add video',
        videoTitle: 'Video title',
        youtubeId: 'YouTube ID',
        duration: 'Duration (seconds)',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete this course?',
        confirmDeleteVideo: 'Are you sure you want to delete this video?',
        noCourses: 'No courses found',
        createFirstCourse: 'Create your first course',
        manageVideos: 'Manage videos',
        back: 'Back',
        free: 'Free',
    },
};

export function CoursesClient({ initialCourses, locale, currentUserRole }: CoursesClientProps) {
    const t = translations[locale as keyof typeof translations] || translations.en;
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [videos, setVideos] = useState<CourseVideo[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [showVideosPanel, setShowVideosPanel] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        thumbnail: '',
        priceInCents: 0,
        currency: 'EUR',
        isActive: true,
        isFeatured: false,
    });

    const [videoFormData, setVideoFormData] = useState({
        title: '',
        description: '',
        youtubeVideoId: '',
        duration: 0,
    });

    const formatPrice = (cents: number, currency: string) => {
        if (cents === 0) return t.free;
        return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
            style: 'currency',
            currency: currency,
        }).format(cents / 100);
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses');
            const data = await res.json();
            if (data.courses) {
                setCourses(data.courses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchVideos = async (courseId: string) => {
        try {
            const res = await fetch(`/api/admin/courses/${courseId}/videos`);
            const data = await res.json();
            if (data.videos) {
                setVideos(data.videos);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const handleCreateCourse = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                await fetchCourses();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating course:', error);
        }
        setLoading(false);
    };

    const handleUpdateCourse = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${selectedCourse.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                await fetchCourses();
                setShowEditModal(false);
                setSelectedCourse(null);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating course:', error);
        }
        setLoading(false);
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm(t.confirmDelete)) return;
        try {
            const res = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchCourses();
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    };

    const handleAddVideo = async () => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${selectedCourse.id}/videos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoFormData),
            });
            if (res.ok) {
                await fetchVideos(selectedCourse.id);
                setShowVideoModal(false);
                resetVideoForm();
            }
        } catch (error) {
            console.error('Error adding video:', error);
        }
        setLoading(false);
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (!selectedCourse) return;
        if (!confirm(t.confirmDeleteVideo)) return;
        try {
            const res = await fetch(`/api/admin/courses/${selectedCourse.id}/videos?videoId=${videoId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchVideos(selectedCourse.id);
                await fetchCourses();
            }
        } catch (error) {
            console.error('Error deleting video:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            thumbnail: '',
            priceInCents: 0,
            currency: 'EUR',
            isActive: true,
            isFeatured: false,
        });
    };

    const resetVideoForm = () => {
        setVideoFormData({
            title: '',
            description: '',
            youtubeVideoId: '',
            duration: 0,
        });
    };

    const openEditModal = (course: Course) => {
        setSelectedCourse(course);
        setFormData({
            title: course.title,
            description: course.description || '',
            thumbnail: course.thumbnail || '',
            priceInCents: course.priceInCents,
            currency: course.currency,
            isActive: course.isActive ?? true,
            isFeatured: course.isFeatured ?? false,
        });
        setShowEditModal(true);
    };

    const openVideosPanel = async (course: Course) => {
        setSelectedCourse(course);
        await fetchVideos(course.id);
        setShowVideosPanel(true);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {t.addCourse}
                </button>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">{t.noCourses}</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        {t.createFirstCourse}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video bg-gray-100 relative">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                {/* Status badges */}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    {course.isFeatured && (
                                        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                        </span>
                                    )}
                                    {course.isActive ? (
                                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full flex items-center gap-1">
                                            <EyeOff className="w-3 h-3" />
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-gray-900 mb-2">{course.title}</h3>
                                {course.description && (
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                                )}

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <Video className="w-4 h-4" />
                                        {course.videoCount} {t.videos}
                                    </span>
                                    <span className="font-semibold text-indigo-600">
                                        {formatPrice(course.priceInCents, course.currency)}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openVideosPanel(course)}
                                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center justify-center gap-1"
                                    >
                                        <Video className="w-4 h-4" />
                                        {t.videos}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(course)}
                                        className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Course Modal */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {showCreateModal ? t.addCourse : t.editCourse}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.courseTitle} *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.courseDescription}
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.courseThumbnail}
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.coursePrice}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.priceInCents}
                                            onChange={(e) => setFormData({ ...formData, priceInCents: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                            min="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatPrice(formData.priceInCents, formData.currency)}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t.currency}
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                                        >
                                            <option value="EUR">EUR (€)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="GBP">GBP (£)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{t.isActive}</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.isFeatured}
                                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{t.isFeatured}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setShowEditModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={showCreateModal ? handleCreateCourse : handleUpdateCourse}
                                    disabled={loading || !formData.title}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {t.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Videos Panel */}
            {showVideosPanel && selectedCourse && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <button
                                        onClick={() => {
                                            setShowVideosPanel(false);
                                            setSelectedCourse(null);
                                            setVideos([]);
                                        }}
                                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t.back}
                                    </button>
                                    <h2 className="text-xl font-semibold">{selectedCourse.title}</h2>
                                    <p className="text-sm text-gray-500">{t.manageVideos}</p>
                                </div>
                                <button
                                    onClick={() => setShowVideoModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t.addVideo}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {videos.length === 0 ? (
                                <div className="text-center py-8">
                                    <Video className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">{t.noVideos}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {videos.sort((a, b) => (a.order || 0) - (b.order || 0)).map((video, index) => (
                                        <div
                                            key={video.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="text-gray-400 font-medium w-8 text-center">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{video.title}</h4>
                                                <p className="text-sm text-gray-500">
                                                    YouTube ID: {video.youtubeVideoId}
                                                    {video.duration && ` • ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteVideo(video.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Video Modal */}
            {showVideoModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">{t.addVideo}</h2>
                                <button
                                    onClick={() => {
                                        setShowVideoModal(false);
                                        resetVideoForm();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.videoTitle} *
                                    </label>
                                    <input
                                        type="text"
                                        value={videoFormData.title}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.youtubeId} *
                                    </label>
                                    <input
                                        type="text"
                                        value={videoFormData.youtubeVideoId}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, youtubeVideoId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                        placeholder="dQw4w9WgXcQ"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        The ID from the YouTube URL (e.g., youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.courseDescription}
                                    </label>
                                    <textarea
                                        value={videoFormData.description}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t.duration}
                                    </label>
                                    <input
                                        type="number"
                                        value={videoFormData.duration}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, duration: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowVideoModal(false);
                                        resetVideoForm();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={handleAddVideo}
                                    disabled={loading || !videoFormData.title || !videoFormData.youtubeVideoId}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {t.save}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
