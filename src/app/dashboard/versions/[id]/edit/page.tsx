"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  useDraggable,
  DragOverlay,
  DragStartEvent,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { api, handleApiError } from "@/services/api";

// Define interface for the version data
interface VersionData {
  id: number;
  header_img: string;
  header_h1_uz: string;
  header_h1_en: string;
  about_p1_uz: string;
  about_p1_en: string;
  about_p2_uz: string;
  about_p2_en: string;
  total_students: number;
  best_students: number;
  total_teachers: number;
  address_uz: string;
  address_en: string;
  work_time: string;
  work_time_sunday: string;
  email: string;
  is_active: boolean;
  main_phone: {
    id: number;
    phone: string;
  };
  web_phones?: { phone_id: number }[];
  // Deprecated mock fields (kept optional for backward compatibility)
  featuredTeachers?: TeacherType[];
  availableTeachers?: TeacherType[];
  // Relations coming from backend – used to pre-populate DnD slots
  web_teachers?: {
    order: number;
    teacher_id: number;
    teacher: {
      id: number;
      name: string;
      surname: string;
      image?: string;
      role?: string;
    };
  }[];
  web_students?: {
    order: number;
    student_id: number;
    student: {
      id: number;
      name: string;
      surname?: string;
      image?: string;
      course?: string;
      cefr?: string;
    };
  }[];
  // Social links selected for this web version
  web_socials?: { social_id: number }[];
  // ----- added optional fields based on DB schema -----
  gallery_p_uz?: string;
  gallery_p_en?: string;
  teachers_p_uz?: string;
  teachers_p_en?: string;
  students_p_uz?: string;
  students_p_en?: string;
  orientation_uz?: string;
  orientation_en?: string;
}

// Define teacher type
interface TeacherType {
  id: string;
  name: string;
  surname: string;
  role: string;
  image?: string;
}

// Media item used in gallery (image or video)
interface MediaItem {
  id: string;
  type: "image" | "video";
  src: string;
}

// Student type used by DnD lists
interface StudentType {
  id: string;
  name: string;
  course: string;
  image?: string;
}

// Social type returned from API
interface SocialType {
  id: number;
  name: string;
  url: string;
  icon?: string;
}

const TeacherCard = ({
  teacher,
  isDragOverlay = false,
  style,
}: {
  teacher: TeacherType;
  isDragOverlay?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={style}
      className={`w-full overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-lg ${
        isDragOverlay ? "bg-white/20 shadow-lg" : "bg-white/5 hover:bg-white/10"
      } border border-white/10 backdrop-blur-sm transition-all duration-300 group cursor-grab active:cursor-grabbing aspect-square ${
        isDragOverlay ? "shadow-xl" : ""
      }`}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden group-hover:scale-110 transition-all duration-300">
        <Image
          src={teacher.image || "/user_icon.png"}
          alt={`${teacher.name} ${teacher.surname}`}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-white text-sm">
          {teacher.name} {teacher.surname}
        </h4>
        <p className="text-xs text-white/70">{teacher.role}</p>
      </div>
    </div>
  );
};

// ---------- NEW: StudentCard component ----------
const StudentCard = ({
  student,
  isDragOverlay = false,
  style,
}: {
  student: StudentType;
  isDragOverlay?: boolean;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={style}
      className={`w-full overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-lg ${
        isDragOverlay ? "bg-white/20 shadow-lg" : "bg-white/5 hover:bg-white/10"
      } border border-white/10 backdrop-blur-sm transition-all duration-300 group cursor-grab active:cursor-grabbing aspect-square ${
        isDragOverlay ? "shadow-xl" : ""
      }`}
    >
      <div className="w-16 h-16 rounded-full overflow-hidden group-hover:scale-110 transition-all duration-300">
        <Image
          src={student.image || "/user_icon.png"}
          alt={student.name}
          width={64}
          height={64}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-white text-sm truncate">
          {student.name}
        </h4>
        <p className="text-xs text-white/70 truncate">{student.course}</p>
      </div>
    </div>
  );
};

const EmptySlot = () => {
  return (
    <div className="flex items-center justify-center p-4 rounded-lg bg-white/5 border-2 border-dashed border-white/10 aspect-square">
      <span className="text-xs text-white/30">Empty Slot</span>
    </div>
  );
};

// ---------------- Media Components ----------------

const DraggableMediaItem = ({
  item,
  onDuplicate,
  onRemove,
}: {
  item: MediaItem;
  onDuplicate: (item: MediaItem) => void;
  onRemove: (item: MediaItem) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 0,
      y: transform?.y ?? 0,
      scaleX: 1,
      scaleY: 1,
    }),
    transition: "transform 200ms ease",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative w-full h-full rounded-lg overflow-hidden bg-white/5 border border-white/10"
    >
      {/* Duplicate button */}
      <button
        type="button"
        className="absolute top-1 right-1 bg-white/20 hover:bg-white/30 text-xs text-white rounded px-1.5 py-0.5 backdrop-blur-sm"
        onPointerDownCapture={(e) => {
          // Prevent drag initiation when pressing duplicate button
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate(item);
        }}
      >
        ⧉
      </button>
      {/* Remove button */}
      <button
        type="button"
        className="absolute top-1 left-1 bg-red-500/60 hover:bg-red-500 text-xs text-white rounded px-1.5 py-0.5 backdrop-blur-sm"
        onPointerDownCapture={(e) => {
          // Prevent drag initiation when pressing remove button
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
      >
        ✕
      </button>
      {item.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt="media"
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={item.src}
          controls
          className="w-full h-full object-cover pointer-events-none"
        />
      )}
    </div>
  );
};

const MediaSlot = ({
  index,
  big,
  item,
  onDuplicate,
  onRemove,
}: {
  index: number;
  big: boolean;
  item: MediaItem | null;
  onDuplicate: (item: MediaItem) => void;
  onRemove: (item: MediaItem) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `media-slot-${index}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center w-[200px] ${
        big ? "h-[416px]" : "h-[200px]"
      } ${isOver ? "border-blue-400/50" : ""}`}
    >
      {item ? (
        <DraggableMediaItem
          item={item}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
        />
      ) : (
        <span className="text-white/20 text-sm">
          Slot {index + 1}
          {big ? " (Big)" : ""}
        </span>
      )}
    </div>
  );
};

interface MediaLibraryProps {
  mediaItems: MediaItem[];
  mediaInputRef: React.RefObject<HTMLInputElement | null>;
  handleMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDuplicate: (item: MediaItem) => void;
  onRemove: (item: MediaItem) => void;
}

const MediaLibrary = ({
  mediaItems,
  mediaInputRef,
  handleMediaUpload,
  onDuplicate,
  onRemove,
}: MediaLibraryProps) => {
  const { setNodeRef } = useDroppable({ id: "media-library" });
  return (
    <div ref={setNodeRef} className="flex flex-wrap gap-4 mt-2">
      {mediaItems.map((item) => (
        <div key={item.id} className="w-[200px] h-[200px]">
          <DraggableMediaItem
            item={item}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        </div>
      ))}

      {/* Add Media tile */}
      <div
        className="relative rounded-lg overflow-hidden w-[200px] h-[200px] bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition"
        onClick={() => mediaInputRef.current?.click()}
      >
        <span className="text-white/70 pointer-events-none">+ Add Media</span>
        <input
          type="file"
          accept="image/*,video/mp4"
          multiple
          ref={mediaInputRef}
          onChange={handleMediaUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

const SortableTeacherItem = ({ teacher }: { teacher: TeacherType }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: teacher.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
    position: "relative" as const,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <TeacherCard teacher={teacher} />
    </div>
  );
};

// ---------- Restore teacher empty slot component (needs to be before use) ----------
const SortableEmptySlot = ({ id }: { id: string }) => {
  const { setNodeRef, isOver, attributes, listeners } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-center p-4 rounded-lg bg-white/5 border-2 border-dashed border-white/10 aspect-square transition-colors ${
        isOver ? "bg-blue-100/10 border-blue-400/30" : ""
      }`}
      style={{ minHeight: 0 }}
    >
      <span className="text-xs text-white/30">Empty Slot</span>
    </div>
  );
};

const DroppableTeacherList = ({
  id,
  title,
  teachers,
  maxItems,
}: {
  id: string;
  title: string;
  teachers: TeacherType[];
  maxItems?: number;
}) => {
  const { setNodeRef } = useDroppable({ id });
  const emptySlotsCount = maxItems ? maxItems - teachers.length : 0;

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden h-full"
    >
      <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
      <SortableContext
        items={teachers.map((t) => t.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]">
          {teachers.map((teacher) => (
            <SortableTeacherItem key={teacher.id} teacher={teacher} />
          ))}
          {maxItems &&
            Array.from({
              length: emptySlotsCount > 0 ? emptySlotsCount : 0,
            }).map((_, index) => <EmptySlot key={`empty-${index}`} />)}

          {/* Add Teacher button as card */}
          {id === "available" && (
            <div className="w-full overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-300 aspect-square cursor-pointer">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl text-white/70">+</span>
                <span className="font-semibold text-white text-sm">
                  Add Teacher
                </span>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// ---------- NEW: Student draggable/droppable components ----------
const SortableStudentItem = ({ student }: { student: StudentType }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: student.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
    position: "relative" as const,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      <StudentCard student={student} />
    </div>
  );
};

const DroppableStudentList = ({
  id,
  title,
  students,
}: {
  id: string;
  title: string;
  students: StudentType[];
}) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden"
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <SortableContext
        items={students.map((s) => s.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {students.map((student) => (
            <SortableStudentItem key={student.id} student={student} />
          ))}

          {/* Add Student button as card */}
          {id === "availableStudents" && (
            <div className="w-full overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-all duration-300 aspect-square cursor-pointer">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl text-white/70">+</span>
                <span className="font-semibold text-white text-sm">
                  Add Student
                </span>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableStudentEmptySlot = ({ id }: { id: string }) => {
  const { setNodeRef, isOver, attributes, listeners } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-center p-4 rounded-lg bg-white/5 border-2 border-dashed border-white/10 aspect-square transition-colors ${
        isOver ? "bg-blue-100/10 border-blue-400/30" : ""
      }`}
      style={{ minHeight: 0 }}
    >
      <span className="text-xs text-white/30">Empty Slot</span>
    </div>
  );
};

const VersionEditPage = () => {
  const { id } = useParams();
  const [version, setVersion] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("header");
  const [featuredSlots, setFeaturedSlots] = useState<(TeacherType | null)[]>(
    () => Array(6).fill(null)
  );
  const [availableTeachers, setAvailableTeachers] = useState<TeacherType[]>([]);
  const [activeTeacher, setActiveTeacher] = useState<TeacherType | null>(null);
  const [activeItemStyle, setActiveItemStyle] = useState<React.CSSProperties>(
    {}
  );
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(
    null
  );
  // Phones list for dropdown
  const [phones, setPhones] = useState<{ id: number; phone: string }[]>([]);
  const [selectedPhoneIds, setSelectedPhoneIds] = useState<Set<number>>(
    new Set()
  );
  const [mainPhoneId, setMainPhoneId] = useState<number | null>(null);

  // Socials
  const [socials, setSocials] = useState<SocialType[]>([]);
  const [selectedSocialIds, setSelectedSocialIds] = useState<Set<number>>(
    new Set()
  );

  // Ref for horizontal scroll container of gallery slots
  const slotScrollRef = useRef<HTMLDivElement | null>(null);

  const scrollSlots = (direction: "left" | "right") => {
    const node = slotScrollRef.current;
    if (!node) return;
    const scrollAmount = 600; // pixels
    node.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ---------------- Gallery (Media) Drag & Drop ----------------
  const TOTAL_GALLERY_SLOTS = 15;
  const [gallerySlots, setGallerySlots] = useState<(MediaItem | null)[]>(() =>
    Array(TOTAL_GALLERY_SLOTS).fill(null)
  );

  // Type-safe ID helpers to avoid runtime errors when ids are not strings
  const isMediaSlotId = (id: unknown): id is string =>
    typeof id === "string" && id.startsWith("media-slot-");

  const placeMedia = (
    arr: (MediaItem | null)[],
    index: number,
    value: MediaItem | null
  ) => {
    const next = [...arr];
    next[index] = value;
    return next;
  };

  const findMediaById = (id: string) => {
    return [...gallerySlots, ...mediaItems].find((m) => m?.id === id);
  };

  const getMediaSlotIndex = (id: string): number => {
    if (isMediaSlotId(id)) {
      return Number(id.split("-")[2]);
    }
    return gallerySlots.findIndex((m) => m?.id === id);
  };

  const mediaContainerOf = (id: string | null | undefined) => {
    if (!id) return null;
    if (isMediaSlotId(id) || gallerySlots.some((m) => m?.id === id)) {
      return "slot";
    }
    if (id === "media-library" || mediaItems.some((m) => m.id === id)) {
      return "library";
    }
    return null;
  };

  // Duplicate media item and place into library
  const handleDuplicateMedia = (media: MediaItem) => {
    const newId = `${media.id}-dup-${Date.now()}`;
    setMediaItems((prev) => [...prev, { ...media, id: newId }]);
  };

  // Remove media item. If it is a duplicate, delete immediately; otherwise confirm with user.
  const handleRemoveMedia = (media: MediaItem) => {
    const performRemoval = () => {
      // Remove from gallery slots
      setGallerySlots((prev) =>
        prev.map((m) => (m?.id === media.id ? null : m))
      );
      // Remove from media library
      setMediaItems((prev) => prev.filter((m) => m.id !== media.id));
    };

    const isDuplicate = media.id.includes("-dup-");
    if (isDuplicate) {
      performRemoval();
      return;
    }

    // Show confirmation toast via Sonner
    toast("Delete this media?", {
      action: {
        label: "Delete",
        onClick: performRemoval,
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // No outer droppable on the featured teachers grid – each slot is its own droppable, keeping hit-testing precise.

  const slotId = (i: number) => `slot-${i}`;
  const isSlotId = (id: unknown): id is string =>
    typeof id === "string" && id.startsWith("slot-");

  // ---------- NEW: Student slot helpers ----------
  const studentSlotId = (i: number) => `student-slot-${i}`;
  const isStudentSlotId = (id: unknown): id is string =>
    typeof id === "string" && id.startsWith("student-slot-");

  const swapStudent = (arr: (StudentType | null)[], i: number, j: number) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const placeStudent = (
    arr: (StudentType | null)[],
    index: number,
    value: StudentType | null
  ) => {
    const next = [...arr];
    next[index] = value;
    return next;
  };

  const findStudentById = (id: string | number) => {
    return [...featuredStudentSlots, ...availableStudents].find((student) =>
      idsMatch(student?.id, id)
    );
  };

  const studentContainerOf = (id: string | number | null | undefined) => {
    if (!id) return null;
    if (
      isStudentSlotId(id) ||
      featuredStudentSlots.some((s) => idsMatch(s?.id, id))
    ) {
      return "featuredStudents";
    }
    if (availableStudents.some((s) => idsMatch(s.id, id))) {
      return "availableStudents";
    }
    return null;
  };

  const swap = (arr: (TeacherType | null)[], i: number, j: number) => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  const place = (
    arr: (TeacherType | null)[],
    index: number,
    value: TeacherType | null
  ) => {
    const next = [...arr];
    next[index] = value;
    return next;
  };

  const findTeacherById = (id: string | number) => {
    return [...featuredSlots, ...availableTeachers].find((teacher) =>
      idsMatch(teacher?.id, id)
    );
  };

  // ---------- NEW: Student drag/drop state ----------
  const [featuredStudentSlots, setFeaturedStudentSlots] = useState<
    (StudentType | null)[]
  >(() => Array(6).fill(null));
  const [availableStudents, setAvailableStudents] = useState<StudentType[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentType | null>(null);

  // File object for header image (used in multipart submission)
  const [headerImgFile, setHeaderImgFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If no id in the route, we are in "new" page – initialize a blank version but still fetch required data
      setLoading(true);

      try {
        const isNew = !id;
        let version: VersionData | null = null;

        // Fetch common reference data (teachers, students, phones, media, socials)
        const [teachersRes, studentsRes, phonesRes, mediaRes, socialsRes] =
          await Promise.all([
            api.teacher.getAll(),
            api.student.getAll(),
            api.phone.getAll(),
            api.media.getAll(),
            api.social.getAll(),
          ]);

        if (isNew) {
          version = {
            id: 0,
            header_img: "",
            header_h1_uz: "",
            header_h1_en: "",
            about_p1_uz: "",
            about_p1_en: "",
            about_p2_uz: "",
            about_p2_en: "",
            total_students: 0,
            best_students: 0,
            total_teachers: 0,
            address_uz: "",
            address_en: "",
            work_time: "",
            work_time_sunday: "",
            email: "",
            is_active: false,
            main_phone: { id: 0, phone: "" },
          } as VersionData;
        } else {
          const versionRes = await api.web.getById(String(id));
          if (versionRes.error) {
            toast.error(handleApiError(versionRes));
            return;
          }
          version = versionRes.data as VersionData;
        }

        // ---------------------- TEACHERS ----------------------
        let allTeachers: TeacherType[] = [];
        const featuredTeacherSlots: (TeacherType | null)[] =
          Array(6).fill(null);
        let availableTeacherList: TeacherType[] = [];
        if (teachersRes.error) {
          toast.error(handleApiError(teachersRes));
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const teachersApiData = (teachersRes.data || []) as any[];
          allTeachers = teachersApiData.map((t) => ({
            id: `teacher-${t.id}`,
            name: t.name,
            surname: t.surname ?? "",
            role: t.role ?? "",
            image: t.image,
          }));

          (version?.web_teachers || []).forEach((wt) => {
            if (wt?.teacher) {
              const teacher: TeacherType = {
                id: `teacher-${wt.teacher.id}`,
                name: wt.teacher.name,
                surname: wt.teacher.surname ?? "",
                role: wt.teacher.role ?? "",
                image: wt.teacher.image,
              };
              const idx = (wt.order ?? 0) - 1;
              if (idx >= 0 && idx < featuredTeacherSlots.length) {
                featuredTeacherSlots[idx] = teacher;
              }
            }
          });

          availableTeacherList = allTeachers.filter(
            (t) =>
              !featuredTeacherSlots.some((ft) => ft && idsMatch(ft.id, t.id))
          );
        }

        // ---------------------- STUDENTS ----------------------
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentsApiData = (studentsRes.data || []) as any[];
        const allStudents: StudentType[] = studentsApiData.map((s) => ({
          id: `student-${s.id}`,
          name: `${s.name} ${s.surname ?? ""}`.trim(),
          course: s.course ?? s.cefr ?? "",
          image: s.image,
        }));

        const featuredStudentSlotsArr: (StudentType | null)[] =
          Array(6).fill(null);
        (version?.web_students || []).forEach((ws) => {
          if (ws?.student) {
            const student: StudentType = {
              id: `student-${ws.student.id}`,
              name: `${ws.student.name} ${ws.student.surname ?? ""}`.trim(),
              course: ws.student.course ?? ws.student.cefr ?? "",
              image: ws.student.image,
            };
            const idx = (ws.order ?? 0) - 1;
            if (idx >= 0 && idx < featuredStudentSlotsArr.length) {
              featuredStudentSlotsArr[idx] = student;
            }
          }
        });

        const availableStudentList = allStudents.filter(
          (s) =>
            !featuredStudentSlotsArr.some((fs) => fs && idsMatch(fs.id, s.id))
        );

        // ---------------------- PHONES ----------------------
        if (phonesRes.error) {
          toast.error(handleApiError(phonesRes));
        } else {
          const phoneApiData = (phonesRes.data || []) as {
            id: number;
            phone: string;
          }[];
          setPhones(phoneApiData);

          // Initialize phone selections
          if (version?.main_phone?.id) {
            setMainPhoneId(version.main_phone.id);
          }
          const initialPhoneIds = new Set<number>();
          if (version?.web_phones) {
            version.web_phones.forEach((p) => initialPhoneIds.add(p.phone_id));
          }
          if (version?.main_phone?.id) {
            initialPhoneIds.add(version.main_phone.id);
          }
          setSelectedPhoneIds(initialPhoneIds);
        }

        // ---------------------- MEDIA ----------------------
        if (mediaRes.error) {
          toast.error(handleApiError(mediaRes));
        } else {
          const mediaApiData = (mediaRes.data || []) as {
            id: number | string;
            is_video: boolean | number;
            url: string;
          }[];

          const allMedia: MediaItem[] = mediaApiData.map<MediaItem>((m) => {
            const normalizedType: "image" | "video" = m.is_video
              ? "video"
              : "image";

            return {
              id: `media-${m.id}`,
              type: normalizedType,
              src: m.url,
            };
          });

          // ---------- Populate gallery slots with already linked media ----------
          const gallerySlotsArr: (MediaItem | null)[] =
            Array(TOTAL_GALLERY_SLOTS).fill(null);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const webMediaRecords = ((version as any)?.web_media || []) as any[];

          webMediaRecords.forEach((wm) => {
            if (!wm) return;

            // Attempt to locate the media item either via nested object or ID
            let mediaItem: MediaItem | undefined;

            // Prefer the nested media object (contains fresh data)
            if (wm.media?.id !== undefined) {
              const normalizedType: "image" | "video" = wm.media.is_video
                ? "video"
                : "image";
              mediaItem = {
                id: `media-${wm.media.id}`,
                type: normalizedType,
                src: wm.media.url,
              };
            } else if (wm.media_id !== undefined && wm.media_id !== null) {
              mediaItem = allMedia.find((m) => m.id === `media-${wm.media_id}`);
            }

            if (mediaItem) {
              const idx = (wm.order ?? 0) - 1; // API uses 1-based order
              if (idx >= 0 && idx < gallerySlotsArr.length) {
                gallerySlotsArr[idx] = mediaItem;
              }
            }
          });

          // Push prepared states
          setGallerySlots(gallerySlotsArr);
          setMediaItems(allMedia);
        }

        // ---------------------- SOCIALS ----------------------
        if (socialsRes.error) {
          toast.error(handleApiError(socialsRes));
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const socialsApiData = (socialsRes.data || []) as any[];
          const allSocials: SocialType[] = socialsApiData.map((s) => ({
            id: s.id,
            name: s.name,
            url: s.url,
            icon: s.icon?.url ?? s.icon_url ?? undefined,
          }));

          setSocials(allSocials);

          const socialIdsSet = new Set<number>();
          (version?.web_socials || []).forEach((ws) =>
            socialIdsSet.add(ws.social_id)
          );
          setSelectedSocialIds(socialIdsSet);
        }

        // ---------------------- SET STATE ----------------------
        setVersion(version as VersionData);
        setFeaturedSlots(featuredTeacherSlots);
        setAvailableTeachers(availableTeacherList);
        setFeaturedStudentSlots(featuredStudentSlotsArr);
        setAvailableStudents(availableStudentList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch version data");
      } finally {
        setLoading(false);
      }
      return;
    };

    fetchData();
  }, [id]);

  // Helper to safely compare IDs that may be string or number
  function idsMatch(a: unknown, b: unknown) {
    return String(a) === String(b);
  }

  const findContainer = (id: string) => {
    if (
      id === "featured" ||
      featuredSlots.some((t) => idsMatch(t?.id, id)) ||
      isSlotId(id)
    ) {
      return "featured";
    }
    if (
      id === "available" ||
      availableTeachers.some((t) => idsMatch(t.id, id))
    ) {
      return "available";
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Detect student first to avoid collision with teacher IDs
    const student = findStudentById(active.id as string);
    if (student) {
      setActiveStudent(student);
      if (active.rect.current?.initial) {
        const { width, height } = active.rect.current.initial;
        setActiveItemStyle({
          width: `${width}px`,
          height: `${height}px`,
        });
      }
      return; // handled student drag
    }

    const teacher = findTeacherById(active.id as string);
    if (teacher) {
      setActiveTeacher(teacher);
      if (active.rect.current?.initial) {
        const { width, height } = active.rect.current.initial;
        setActiveItemStyle({
          width: `${width}px`,
          height: `${height}px`,
        });
      }
      return; // handled teacher drag
    }

    const media = findMediaById(active.id as string);
    if (media) {
      setActiveMediaItem(media);

      // Determine container to decide overlay size
      const container = mediaContainerOf(active.id as string);

      // Default to initial dimensions
      let widthPx = active.rect.current?.initial?.width ?? 200;
      let heightPx = active.rect.current?.initial?.height ?? 200;

      // Clamp to 200x200 when dragging from media library to avoid oversized shadow
      if (container === "library") {
        widthPx = 200;
        heightPx = 200;
      }

      setActiveItemStyle({
        width: `${widthPx}px`,
        height: `${heightPx}px`,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // --- Media drag handling ---
    const activeMedia = findMediaById(active.id as string);
    if (activeMedia) {
      if (!over) {
        resetActive();
        return;
      }

      const overId = over.id as string;
      const activeContainer = mediaContainerOf(active.id as string);
      const overContainer = mediaContainerOf(overId);

      // Determine target slot index if over a slot or item in slot
      const targetSlotIndex =
        overContainer === "slot" ? getMediaSlotIndex(overId) : -1;

      if (activeContainer === "slot" && overContainer === "slot") {
        // Swap between slots
        const fromIndex = gallerySlots.findIndex(
          (m) => m?.id === activeMedia.id
        );
        if (
          fromIndex !== -1 &&
          targetSlotIndex !== -1 &&
          fromIndex !== targetSlotIndex
        ) {
          setGallerySlots((prev) => {
            const next = [...prev];
            [next[fromIndex], next[targetSlotIndex]] = [
              next[targetSlotIndex],
              next[fromIndex],
            ];
            return next;
          });
        }
      } else if (activeContainer === "library" && overContainer === "slot") {
        // Move from library to empty slot (if empty)
        if (targetSlotIndex !== -1 && !gallerySlots[targetSlotIndex]) {
          setMediaItems((prev) => prev.filter((m) => m.id !== activeMedia.id));
          setGallerySlots((prev) =>
            placeMedia(prev, targetSlotIndex, activeMedia)
          );
        }
      } else if (activeContainer === "slot" && overContainer === "library") {
        // Move from slot back to library
        const fromIndex = gallerySlots.findIndex(
          (m) => m?.id === activeMedia.id
        );
        if (fromIndex !== -1) {
          setGallerySlots((prev) => placeMedia(prev, fromIndex, null));
          setMediaItems((prev) => [...prev, activeMedia]);
        }
      }

      resetActive();
      return;
    }

    // --- Student drag handling ---
    if (activeStudent) {
      if (!over) {
        resetActive();
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeContainer = studentContainerOf(activeId);
      const overContainer =
        studentContainerOf(overId) ||
        (over.data.current?.sortable?.containerId as string) ||
        overId;

      if (
        activeContainer === "featuredStudents" &&
        overContainer === "featuredStudents"
      ) {
        const from = featuredStudentSlots.findIndex((s) =>
          idsMatch(s?.id, activeId)
        );
        const to = isStudentSlotId(overId)
          ? Number(overId.split("-")[2])
          : featuredStudentSlots.findIndex((s) => idsMatch(s?.id, overId));

        if (from !== -1 && to !== -1 && from !== to) {
          setFeaturedStudentSlots((prev) => swapStudent(prev, from, to));
        }
      } else if (
        activeContainer === "availableStudents" &&
        overContainer === "featuredStudents"
      ) {
        const targetIndex = isStudentSlotId(overId)
          ? Number(overId.split("-")[2])
          : featuredStudentSlots.findIndex((s) => idsMatch(s?.id, overId));

        if (targetIndex !== -1 && !featuredStudentSlots[targetIndex]) {
          setAvailableStudents((prev) =>
            prev.filter((s) => !idsMatch(s.id, activeId))
          );
          setFeaturedStudentSlots((prev) =>
            placeStudent(prev, targetIndex, activeStudent)
          );
        }
      } else if (
        activeContainer === "featuredStudents" &&
        (overContainer === "availableStudents" ||
          overId === "availableStudents")
      ) {
        const fromIndex = featuredStudentSlots.findIndex((s) =>
          idsMatch(s?.id, activeId)
        );
        if (fromIndex !== -1) {
          setFeaturedStudentSlots((prev) =>
            placeStudent(prev, fromIndex, null)
          );
          setAvailableStudents((prev) => [...prev, activeStudent]);
        }
      }

      resetActive();
      return;
    }

    // --- Teacher drag handling ---
    if (activeTeacher) {
      if (!over) {
        resetActive();
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeContainer = findContainer(activeId);
      const overContainer =
        findContainer(overId) ||
        (over.data.current?.sortable?.containerId as string) ||
        overId;

      if (activeContainer === "featured" && overContainer === "featured") {
        const from = featuredSlots.findIndex((t) => idsMatch(t?.id, activeId));
        const to = isSlotId(overId)
          ? Number(overId.split("-")[1])
          : featuredSlots.findIndex((t) => idsMatch(t?.id, overId));

        if (from !== -1 && to !== -1 && from !== to) {
          setFeaturedSlots((s) => swap(s, from, to));
        }
      } else if (
        activeContainer === "available" &&
        overContainer === "featured"
      ) {
        const targetIndex = isSlotId(overId)
          ? Number(overId.split("-")[1])
          : featuredSlots.findIndex((t) => idsMatch(t?.id, overId));

        if (targetIndex !== -1 && !featuredSlots[targetIndex]) {
          setAvailableTeachers((prev) =>
            prev.filter((t) => !idsMatch(t.id, activeId))
          );
          setFeaturedSlots((prev) => place(prev, targetIndex, activeTeacher));
        }
      } else if (
        activeContainer === "featured" &&
        overContainer === "available"
      ) {
        const fromIndex = featuredSlots.findIndex((t) =>
          idsMatch(t?.id, activeId)
        );
        if (fromIndex !== -1) {
          setFeaturedSlots((prev) => place(prev, fromIndex, null));
          setAvailableTeachers((prev) => [...prev, activeTeacher]);
        }
      }
      resetActive();
      return;
    }

    resetActive();
  };

  const handleDragCancel = () => {
    setActiveTeacher(null);
    setActiveItemStyle({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (version) {
      setVersion({
        ...version,
        [name]: value,
      } as VersionData);
    }
  };

  const handlePhoneSelectionChange = (phoneId: number) => {
    setSelectedPhoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(phoneId)) {
        next.delete(phoneId);
        // If the deselected phone was the main phone, unset main phone
        if (mainPhoneId === phoneId) {
          setMainPhoneId(null);
        }
      } else {
        next.add(phoneId);
      }
      return next;
    });
  };

  const handleMainPhoneChange = (phoneId: number) => {
    // A phone must be selected to become main
    if (selectedPhoneIds.has(phoneId)) {
      setMainPhoneId(phoneId);
    }
  };

  const handleSocialSelectionChange = (socialId: number) => {
    setSelectedSocialIds((prev) => {
      const next = new Set(prev);
      if (next.has(socialId)) {
        next.delete(socialId);
      } else {
        next.add(socialId);
      }
      return next;
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (version) {
      setVersion({
        ...version,
        [name]: parseInt(value, 10),
      } as VersionData);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && version) {
      setHeaderImgFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setVersion({
          ...version,
          header_img: result,
        } as VersionData);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ---------------- Media Library ---------------- */
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const uploadedItems: MediaItem[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "is_video",
        String(file.type.startsWith("video") ? 1 : 0)
      );
      formData.append("name", file.name);

      const res = await api.media.create(formData);
      if (res.error) {
        toast.error(handleApiError(res));
        continue;
      }

      const m = res.data as {
        id: number | string;
        is_video: boolean | number;
        url: string;
      };

      uploadedItems.push({
        id: `media-${m.id}`,
        type: m.is_video ? "video" : "image",
        src: m.url,
      });
    }

    if (uploadedItems.length) {
      setMediaItems((prev) => [...prev, ...uploadedItems]);
      toast.success(
        `${uploadedItems.length} file${
          uploadedItems.length > 1 ? "s" : ""
        } uploaded`
      );
    }

    // reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version) return;

    // Helper to extract a numeric ID if present, otherwise return original string
    const toId = (rawId: string): number | string => {
      const match = rawId.match(/\d+/);
      return match ? Number(match[0]) : rawId;
    };

    const web_teachers = featuredSlots
      .map((t, i) =>
        t
          ? {
              order: i + 1,
              teacher_id: Number(t.id.replace(/^teacher-/, "")),
            }
          : null
      )
      .filter(Boolean);

    const web_students = featuredStudentSlots
      .map((s, i) =>
        s
          ? {
              order: i + 1,
              student_id: Number(s.id.replace(/^student-/, "")),
            }
          : null
      )
      .filter(Boolean);

    const web_media = gallerySlots
      .map((m, i) =>
        m
          ? {
              order: i + 1,
              size: (i + 1) % 3 === 0 ? "1x2" : "1x1", // every 3rd slot is big
              media_id: toId(String(m.id)),
            }
          : null
      )
      .filter(Boolean);

    const web_phones = Array.from(selectedPhoneIds).map((phoneId) => ({
      phone_id: phoneId,
    }));

    const web_socials = Array.from(selectedSocialIds).map((socialId) => ({
      social_id: socialId,
    }));

    // Build multipart/form-data
    const fd = new FormData();

    // Append file if selected
    if (headerImgFile) {
      fd.append("header_img", headerImgFile);
    }

    // Scalar fields
    const scalarFields: { [key: string]: unknown } = {
      header_h1_uz: version.header_h1_uz,
      header_h1_en: version.header_h1_en,
      about_p1_uz: version.about_p1_uz,
      about_p1_en: version.about_p1_en,
      about_p2_uz: version.about_p2_uz,
      about_p2_en: version.about_p2_en,
      total_students: version.total_students,
      best_students: version.best_students,
      total_teachers: version.total_teachers,
      gallery_p_uz: version.gallery_p_uz,
      gallery_p_en: version.gallery_p_en,
      teachers_p_uz: version.teachers_p_uz,
      teachers_p_en: version.teachers_p_en,
      students_p_uz: version.students_p_uz,
      students_p_en: version.students_p_en,
      address_uz: version.address_uz,
      address_en: version.address_en,
      orientation_uz: version.orientation_uz,
      orientation_en: version.orientation_en,
      work_time: version.work_time,
      work_time_sunday: version.work_time_sunday,
      main_phone_id: mainPhoneId,
      email: version.email,
    };

    Object.entries(scalarFields).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        fd.append(key, String(val));
      }
    });

    // Helper to append array objects in "field[index][key]" format
    const appendNestedArray = (
      field: string,
      arr: Record<string, unknown>[]
    ) => {
      arr.forEach((obj, idx) => {
        Object.entries(obj).forEach(([k, v]) => {
          if (v !== undefined && v !== null)
            fd.append(`${field}[${idx}][${k}]`, String(v));
        });
      });
    };

    appendNestedArray("web_media", web_media as Record<string, unknown>[]);
    appendNestedArray("web_phones", web_phones as Record<string, unknown>[]);
    appendNestedArray("web_socials", web_socials as Record<string, unknown>[]);
    appendNestedArray(
      "web_students",
      web_students as Record<string, unknown>[]
    );
    appendNestedArray(
      "web_teachers",
      web_teachers as Record<string, unknown>[]
    );

    // Debug: log payload that will be sent to API
    console.log("Web Version payload", Object.fromEntries(fd.entries()));

    try {
      const res =
        version.id === 0
          ? await api.web.create(fd)
          : await api.web.update(version.id, fd);
      if (res.error) {
        toast.error(handleApiError(res));
        return;
      }

      toast.success("Changes saved successfully", {
        description: `Version ${version.id} has been updated.`,
        duration: 4000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  const resetActive = () => {
    setActiveTeacher(null);
    setActiveStudent(null);
    setActiveMediaItem(null);
    setActiveItemStyle({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-[#4f9bff]/30 rounded-full animate-ping"></div>
          <div className="relative z-10 w-16 h-16 border-4 border-t-[#4f9bff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const ids = featuredSlots.map((t, i) => (t ? t.id : slotId(i)));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="bg-transparent text-white">
        <header className="bg-black/20 backdrop-blur-sm sticky top-0 z-30 rounded-xl">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {version?.id === 0
                ? "Create New Version"
                : `Edit Version ${version?.id}`}
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/versions"
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors border border-white/20 rounded-lg hover:bg-white/10"
              >
                Cancel
              </Link>
              <button
                onClick={handleFormSubmit}
                className="px-4 py-2 text-sm bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30"
              >
                Save Changes
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar navigation */}
            <div className="w-64 shrink-0">
              <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 sticky top-24 z-20">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Edit Sections
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab("header")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "header"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Header Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "about"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      About Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("gallery")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "gallery"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Gallery Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("teachers")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "teachers"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Teachers Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("students")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "students"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Students Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("socials")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "socials"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Socials Section
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("location")}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        activeTab === "location"
                          ? "bg-[#4f9bff] text-white shadow-lg shadow-[#4f9bff]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Location Section
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Form sections */}
            <div className="flex-1 min-w-0">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Header Section */}
                {activeTab === "header" && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        Header Section
                      </h3>
                    </div>

                    <div className="mb-6">
                      <label className="block text-white/70 text-sm mb-2">
                        Header Image
                      </label>
                      <div className="relative rounded-lg overflow-hidden aspect-square w-full max-w-md bg-white/5 border border-white/10">
                        {version?.header_img ? (
                          <Image
                            src={version.header_img}
                            alt="Header preview"
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-white/50">
                              No image selected
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer px-4 py-2 bg-[#4f9bff]/80 text-white rounded-lg hover:bg-[#4f9bff] transition-colors">
                            Upload Image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Header Title (English)
                        </label>
                        <input
                          type="text"
                          name="header_h1_en"
                          value={version?.header_h1_en}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Header Title (Uzbek)
                        </label>
                        <input
                          type="text"
                          name="header_h1_uz"
                          value={version?.header_h1_uz}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeTab === "about" && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      About Section
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          About Paragraph 1 (English)
                        </label>
                        <textarea
                          name="about_p1_en"
                          value={version?.about_p1_en}
                          onChange={handleChange}
                          rows={3}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          About Paragraph 1 (Uzbek)
                        </label>
                        <textarea
                          name="about_p1_uz"
                          value={version?.about_p1_uz}
                          onChange={handleChange}
                          rows={3}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          About Paragraph 2 (English)
                        </label>
                        <textarea
                          name="about_p2_en"
                          value={version?.about_p2_en}
                          onChange={handleChange}
                          rows={3}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          About Paragraph 2 (Uzbek)
                        </label>
                        <textarea
                          name="about_p2_uz"
                          value={version?.about_p2_uz}
                          onChange={handleChange}
                          rows={3}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Total Students
                          </label>
                          <input
                            type="number"
                            name="total_students"
                            value={version?.total_students}
                            onChange={handleNumberChange}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Best Students
                          </label>
                          <input
                            type="number"
                            name="best_students"
                            value={version?.best_students}
                            onChange={handleNumberChange}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Total Teachers
                          </label>
                          <input
                            type="number"
                            name="total_teachers"
                            value={version?.total_teachers}
                            onChange={handleNumberChange}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gallery Section */}
                {activeTab === "gallery" && (
                  <div className="space-y-8">
                    {/* Gallery Paragraphs */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Gallery Paragraph
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Gallery Paragraph (English)
                          </label>
                          <textarea
                            name="gallery_p_en"
                            value={version?.gallery_p_en || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Gallery Paragraph (Uzbek)
                          </label>
                          <textarea
                            name="gallery_p_uz"
                            value={version?.gallery_p_uz || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Featured Slots (drag targets) */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative h-full overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">
                          Featured Slots (Drop Here)
                        </h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => scrollSlots("left")}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollSlots("right")}
                            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white"
                          >
                            →
                          </button>
                        </div>
                      </div>
                      {/* Horizontal scrollable slot layout */}
                      <div
                        ref={slotScrollRef}
                        className="flex gap-8 overflow-x-auto pb-4 whitespace-nowrap"
                      >
                        {(() => {
                          const totalSlots = 15;
                          const groups = Math.ceil(totalSlots / 3);
                          const nodes: React.ReactElement[] = [];

                          const renderSlot = (
                            slotIndexZeroBased: number,
                            big: boolean
                          ) => (
                            <MediaSlot
                              key={`slot-${slotIndexZeroBased}`}
                              index={slotIndexZeroBased}
                              big={big}
                              item={gallerySlots[slotIndexZeroBased]}
                              onDuplicate={handleDuplicateMedia}
                              onRemove={handleRemoveMedia}
                            />
                          );

                          for (let g = 0; g < groups; g++) {
                            const base = g * 3;
                            nodes.push(
                              <div
                                key={`group-${g}`}
                                className="flex gap-4 shrink-0"
                              >
                                <div className="flex flex-col gap-4">
                                  {renderSlot(base, false)}
                                  {renderSlot(base + 1, false)}
                                </div>
                                {renderSlot(base + 2, true)}
                              </div>
                            );
                          }

                          return nodes;
                        })()}
                      </div>
                    </div>

                    {/* Media Library */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Media Library (Images / Videos)
                      </h3>
                      {(() => {
                        // Hide media items that are already placed in gallery slots
                        const libraryMediaItems = mediaItems.filter(
                          (m) => !gallerySlots.some((slot) => slot?.id === m.id)
                        );
                        return (
                          <MediaLibrary
                            mediaItems={libraryMediaItems}
                            mediaInputRef={mediaInputRef}
                            handleMediaUpload={handleMediaUpload}
                            onDuplicate={handleDuplicateMedia}
                            onRemove={handleRemoveMedia}
                          />
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Teachers Section */}
                {activeTab === "teachers" && (
                  <div className="space-y-8">
                    {/* Teachers Paragraph */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Teachers Paragraph
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Teachers Paragraph (English)
                          </label>
                          <textarea
                            name="teachers_p_en"
                            value={version?.teachers_p_en || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Teachers Paragraph (Uzbek)
                          </label>
                          <textarea
                            name="teachers_p_uz"
                            value={version?.teachers_p_uz || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden h-full">
                      <h3 className="text-xl font-bold mb-4 text-white">
                        Featured Teachers (Drop Slots)
                      </h3>
                      <SortableContext
                        items={ids}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]">
                          {ids.map((id, i) =>
                            isSlotId(id) ? (
                              <SortableEmptySlot key={id} id={id} />
                            ) : (
                              <SortableTeacherItem
                                key={id}
                                teacher={featuredSlots[i]!}
                              />
                            )
                          )}
                        </div>
                      </SortableContext>
                    </div>
                    <DroppableTeacherList
                      id="available"
                      title="Available Teachers"
                      teachers={availableTeachers}
                    />
                  </div>
                )}

                {activeTab === "students" && (
                  <div className="space-y-8">
                    {/* Students Paragraph */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        Students Paragraph
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Students Paragraph (English)
                          </label>
                          <textarea
                            name="students_p_en"
                            value={version?.students_p_en || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Students Paragraph (Uzbek)
                          </label>
                          <textarea
                            name="students_p_uz"
                            value={version?.students_p_uz || ""}
                            onChange={handleChange}
                            rows={2}
                            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Featured Students */}
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6 relative overflow-hidden h-full">
                      <h3 className="text-xl font-bold mb-4 text-white">
                        Featured Students (Drop Slots)
                      </h3>
                      {(() => {
                        const studentIds = featuredStudentSlots.map((s, i) =>
                          s ? s.id : studentSlotId(i)
                        );
                        return (
                          <SortableContext
                            items={studentIds}
                            strategy={rectSortingStrategy}
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[150px]">
                              {studentIds.map((id, i) =>
                                isStudentSlotId(id) ? (
                                  <SortableStudentEmptySlot key={id} id={id} />
                                ) : (
                                  <SortableStudentItem
                                    key={id}
                                    student={featuredStudentSlots[i]!}
                                  />
                                )
                              )}
                            </div>
                          </SortableContext>
                        );
                      })()}
                    </div>

                    {/* Available Students */}
                    <DroppableStudentList
                      id="availableStudents"
                      title="Available Students"
                      students={availableStudents}
                    />
                  </div>
                )}

                {activeTab === "socials" && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Socials Section
                    </h3>

                    <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                      {socials.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`social-${s.id}`}
                              checked={selectedSocialIds.has(s.id)}
                              onChange={() => handleSocialSelectionChange(s.id)}
                              className="form-checkbox h-4 w-4 bg-white/10 border-white/20 text-[#4f9bff] focus:ring-[#4f9bff]/50 rounded"
                            />
                            <label
                              htmlFor={`social-${s.id}`}
                              className="text-white flex items-center gap-2"
                            >
                              {s.icon && (
                                <Image
                                  src={s.icon}
                                  alt={s.name}
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              )}
                              <span>{s.name}</span>
                            </label>
                          </div>
                          {selectedSocialIds.has(s.id) && (
                            <span className="text-xs text-white/50 truncate max-w-xs">
                              {s.url}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#172442]/90 to-[#0f1a35]/90 backdrop-blur-sm p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Location Section
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Address (English)
                        </label>
                        <input
                          type="text"
                          name="address_en"
                          value={version?.address_en}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Address (Uzbek)
                        </label>
                        <input
                          type="text"
                          name="address_uz"
                          value={version?.address_uz}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Work Hours
                        </label>
                        <input
                          type="text"
                          name="work_time"
                          value={version?.work_time}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Sunday Hours
                        </label>
                        <input
                          type="text"
                          name="work_time_sunday"
                          value={version?.work_time_sunday}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={version?.email}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Phone Numbers
                        </label>
                        <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/10">
                          {phones.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`phone-${p.id}`}
                                  checked={selectedPhoneIds.has(p.id)}
                                  onChange={() =>
                                    handlePhoneSelectionChange(p.id)
                                  }
                                  className="form-checkbox h-4 w-4 bg-white/10 border-white/20 text-[#4f9bff] focus:ring-[#4f9bff]/50 rounded"
                                />
                                <label
                                  htmlFor={`phone-${p.id}`}
                                  className="text-white"
                                >
                                  {p.phone}
                                </label>
                              </div>
                              {selectedPhoneIds.has(p.id) && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="radio"
                                    id={`main-phone-${p.id}`}
                                    name="main_phone"
                                    checked={mainPhoneId === p.id}
                                    onChange={() => handleMainPhoneChange(p.id)}
                                    className="form-radio h-4 w-4 bg-white/10 border-white/20 text-[#4f9bff] focus:ring-[#4f9bff]/50"
                                  />
                                  <label
                                    htmlFor={`main-phone-${p.id}`}
                                    className="text-xs text-white/70"
                                  >
                                    Main
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Orientation (English)
                        </label>
                        <input
                          type="text"
                          name="orientation_en"
                          value={version?.orientation_en || ""}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          Orientation (Uzbek)
                        </label>
                        <input
                          type="text"
                          name="orientation_uz"
                          value={version?.orientation_uz || ""}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4f9bff]/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Form action buttons for mobile */}
                <div className="lg:hidden flex justify-end gap-4 mt-6">
                  <Link
                    href="/dashboard/versions"
                    className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors border border-white/20 rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-[#4f9bff] hover:bg-[#3b82f6] text-white rounded-lg transition-colors shadow-lg shadow-[#4f9bff]/30"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
      {typeof window !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTeacher ? (
              <TeacherCard
                teacher={activeTeacher}
                isDragOverlay
                style={activeItemStyle}
              />
            ) : activeStudent ? (
              <StudentCard
                student={activeStudent}
                isDragOverlay
                style={activeItemStyle}
              />
            ) : activeMediaItem ? (
              <div
                style={{ width: 200, height: 200, ...activeItemStyle }}
                className="rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                {activeMediaItem.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeMediaItem.src}
                    alt="media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={activeMediaItem.src}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
};

export default VersionEditPage;
