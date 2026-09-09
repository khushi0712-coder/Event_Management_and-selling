import { useEffect, useMemo, useRef, useState } from "react";

import {
  FiArchive,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCopy,
  FiEdit2,
  FiMoreVertical,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

/* =========================================================
   HELPERS
========================================================= */

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDayKey = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "C";

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

/* =========================================================
   COMPONENT
========================================================= */

const ContactDetailsDrawer = ({
  message,
  metadata = {},
  customerInfo,
  threadMessages = [],

  onClose,
  onMarkRead,
  onMarkReplied,
  onResolve,
  onPriorityChange,
  onArchive,
  onDelete,

  replyText = "",
  onReplyChange,
  onReplySend,
  replySending = false,

  onReplyEdit,
  onReplyDelete,
}) => {
  /* =======================================================
     DRAWER
  ======================================================= */

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  /* =======================================================
     MENUS
  ======================================================= */

  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  /* =======================================================
     MESSAGE MENU
  ======================================================= */

  const [openMessageMenu, setOpenMessageMenu] =
    useState(null);

  /* =======================================================
     EDIT
  ======================================================= */

  const [editingReply, setEditingReply] =
    useState(null);

  const [editingReplyId, setEditingReplyId] =
    useState(null);

  const [editingText, setEditingText] =
    useState("");

  const [editSaving, setEditSaving] =
    useState(false);

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteReplyId, setDeleteReplyId] =
    useState(null);

  const [deleteSaving, setDeleteSaving] =
    useState(false);

  /* =======================================================
     COPY
  ======================================================= */

  const [copiedReplyId, setCopiedReplyId] =
    useState(null);

  /* =======================================================
     REFS
  ======================================================= */

  const replyInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* =======================================================
     OPEN DRAWER
  ======================================================= */

  useEffect(() => {
    if (!message) return;

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const resetTimer = window.setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      setMoreOpen(false);
      setSearchOpen(false);
      setSearchText("");
      setOpenMessageMenu(null);
      setEditingReply(null);
      setEditingReplyId(null);
      setEditingText("");
      setEditSaving(false);
      setDeleteReplyId(null);
      setDeleteSaving(false);
    }, 0);

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 20);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(resetTimer);
      document.body.style.overflow =
        oldOverflow || "";
    };
  }, [message]);

  function handleClose() {
    if (isClosing) return;

    setIsClosing(true);
    setIsVisible(false);

    window.setTimeout(() => {
      onClose?.();
    }, 280);
  }

  function cancelEditReply() {
    if (editSaving) return;

    setEditingReply(null);
    setEditingReplyId(null);
    setEditingText("");
    setEditSaving(false);
  }

  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (deleteReplyId) {
        setDeleteReplyId(null);
        return;
      }

      if (editingReplyId) {
        cancelEditReply();
        return;
      }

      if (openMessageMenu) {
        setOpenMessageMenu(null);
        return;
      }

      if (searchOpen) {
        setSearchOpen(false);
        setSearchText("");
        return;
      }

      if (moreOpen) {
        setMoreOpen(false);
        return;
      }

      handleClose();
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    deleteReplyId,
    editingReplyId,
    openMessageMenu,
    searchOpen,
    moreOpen,
  ]);

  /* =======================================================
     REPLY
  ======================================================= */

  const handleSendReply = async () => {
    if (
      !replyText.trim() ||
      replySending
    ) {
      return;
    }

    try {
      const result =
        await onReplySend?.();

      if (result !== false) {
        onReplyChange?.("");

        window.setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 120);
      }
    } catch {
      // Parent handles API error.
    }
  };

  /* =======================================================
     COPY MESSAGE
  ======================================================= */

  const handleCopyReply = async (reply) => {
    if (!reply?.message) return;

    const id =
      reply._id ||
      reply.id;

    try {
      await navigator.clipboard.writeText(
        reply.message
      );

      setCopiedReplyId(id);

      window.setTimeout(() => {
        setCopiedReplyId(null);
      }, 1300);
    } catch {
      // Clipboard unavailable.
    }

    setOpenMessageMenu(null);
  };

  /* =======================================================
     EDIT MESSAGE
  ======================================================= */

  const startEditReply = (reply) => {
    const id =
      reply._id ||
      reply.id;

    setOpenMessageMenu(null);

    setEditingReply(reply);
    setEditingReplyId(id);
    setEditingText(
      reply.message || ""
    );
    setEditSaving(false);
  };

  const saveEditedReply = async () => {
    if (
      !editingReply ||
      editSaving
    ) {
      return;
    }

    const id =
      editingReply._id ||
      editingReply.id;

    const text =
      editingText.trim();

    if (!text) return;

    try {
      setEditSaving(true);

      if (onReplyEdit) {
        const result =
          await onReplyEdit({
            ...editingReply,
            _id: id,
            message: text,
            edited: true,
            editedAt:
              new Date().toISOString(),
          });

        if (result === false) {
          setEditSaving(false);
          return;
        }
      }

      setEditingReply(null);
      setEditingReplyId(null);
      setEditingText("");
      setEditSaving(false);
    } catch {
      setEditSaving(false);
    }
  };

  /* =======================================================
     DELETE REPLY
  ======================================================= */

  const confirmDeleteReply = async () => {
    if (
      !deleteReplyId ||
      deleteSaving
    ) {
      return;
    }

    try {
      setDeleteSaving(true);

      if (onReplyDelete) {
        const result =
          await onReplyDelete(
            deleteReplyId
          );

        if (result === false) {
          setDeleteSaving(false);
          return;
        }
      }

      setDeleteReplyId(null);
      setDeleteSaving(false);
    } catch {
      setDeleteSaving(false);
    }
  };

  /* =======================================================
     DATA
  ======================================================= */

  const status =
    message?.archived
      ? "Archived"
      : metadata.status ||
        (metadata.read
          ? "Read"
          : "Unread");

  const priority =
    metadata.priority ||
    "Normal";

  const isUnread =
    status === "Unread";

  const name =
    message?.name ||
    customerInfo?.name ||
    "Unknown user";

  const initials =
    getInitials(name);

  /* =======================================================
     CUSTOMER MESSAGES
  ======================================================= */

  const olderMessages = useMemo(() => {
    if (!Array.isArray(threadMessages)) {
      return [];
    }

    return threadMessages.filter(
      (item) =>
        String(item?._id) !==
        String(message?._id)
    );
  }, [
    threadMessages,
    message?._id,
  ]);

  /* =======================================================
     ADMIN REPLIES
  ======================================================= */

  const adminReplies = useMemo(() => {
    if (!Array.isArray(message?.replies)) {
      return [];
    }

    return message?.replies;
  }, [message?.replies]);

  /* =======================================================
     COMPLETE TIMELINE
  ======================================================= */

  const conversation = useMemo(() => {
    const customerMessages = [
      {
        ...message,
        type: message?.senderType === "admin" ? "admin" : "customer",
        uniqueId:
          `customer-${message?._id}`,
      },

      ...olderMessages.map(
        (item) => ({
          ...item,
          type: "customer",
          uniqueId:
            `customer-${item._id}`,
        })
      ),
    ];

    const replies =
      adminReplies.map(
        (reply, index) => ({
          ...reply,
          type: "admin",
          uniqueId:
            `admin-${
              reply._id ||
              reply.id ||
              index
            }`,
        })
      );

    return [
      ...customerMessages,
      ...replies,
    ].sort((a, b) => {
      const first =
        new Date(
          a.createdAt || 0
        ).getTime();

      const second =
        new Date(
          b.createdAt || 0
        ).getTime();

      return first - second;
    });
  }, [
    message,
    olderMessages,
    adminReplies,
  ]);

  /* =======================================================
     SEARCHED CONVERSATION
  ======================================================= */

  const filteredConversation =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      if (!query) {
        return conversation;
      }

      return conversation.filter(
        (item) => {
          const text = (
            item.message ||
            item.body ||
            ""
          ).toLowerCase();

          return text.includes(query);
        }
      );
    }, [
      conversation,
      searchText,
    ]);

  if (!message) return null;

  /* =======================================================
     AVATAR
  ======================================================= */

  const avatar =
    customerInfo?.avatar ||
    message?.avatar ||
    message?.profileImage ||
    message?.image;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          CUSTOM ANIMATIONS
      =================================================== */}

      <style>
        {`
          @keyframes drawerBackdrop {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes drawerSlide {
            from {
              opacity: 0;
              transform: translateX(35px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes chatMessage {
            from {
              opacity: 0;
              transform: translateY(4px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes modalScale {
            from {
              opacity: 0;
              transform: scale(.96)
                translateY(8px);
            }

            to {
              opacity: 1;
              transform: scale(1)
                translateY(0);
            }
          }

          .modern-chat-scroll::-webkit-scrollbar {
            width: 5px;
          }

          .modern-chat-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .modern-chat-scroll::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.16);
            border-radius: 999px;
          }

          .modern-chat-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(148,163,184,.26);
          }

          .modern-chat-scroll {
            scrollbar-width: thin;
            scrollbar-color:
              rgba(148,163,184,.16)
              transparent;
          }

          .modern-textarea::-webkit-scrollbar {
            width: 4px;
          }

          .modern-textarea::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.18);
            border-radius: 999px;
          }
        `}
      </style>

      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        className={`
          fixed
          inset-0
          z-[80]

          bg-black/60

          backdrop-blur-[3px]

          transition-opacity
          duration-300

          ${
            isVisible
              ? "opacity-100"
              : "opacity-0"
          }
        `}
        onClick={handleClose}
      />

      {/* ===================================================
          MAIN DRAWER
      =================================================== */}

      <aside
        className={`
          fixed
          right-0
          top-0
          z-[90]

          flex
          h-[100dvh]
          w-full
          max-w-[620px]
          flex-col

          overflow-hidden

          border-l
          border-white/[0.08]

          bg-[#070c16]

          shadow-[-30px_0_100px_rgba(0,0,0,.60)]

          transition-transform
          duration-[280ms]
          ease-[cubic-bezier(.22,1,.36,1)]

          ${
            isVisible
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            relative
            z-30

            flex
            h-[70px]
            shrink-0
            items-center
            justify-between

            border-b
            border-white/[0.07]

            bg-[#0a101c]/95

            px-4
            sm:px-5

            backdrop-blur-xl
          "
        >
          {/* LEFT */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {/* Avatar */}

            <div
              className="
                relative

                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                overflow-hidden

                rounded-full

                border
                border-white/[0.08]

                bg-gradient-to-br
                from-slate-700
                to-slate-900

                text-xs
                font-bold
                text-slate-100
              "
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}

              {/* ONLINE / STATUS */}

              <span
                className="
                  absolute
                  bottom-0
                  right-0

                  h-2.5
                  w-2.5

                  rounded-full

                  border-2
                  border-[#0a101c]

                  bg-emerald-400
                "
              />
            </div>

            {/* NAME ONLY */}

            <div className="min-w-0">
              <h2
                className="
                  truncate

                  text-[15px]
                  font-semibold
                  leading-5

                  text-white
                "
              >
                {name}
              </h2>

              <div
                className="
                  mt-0.5

                  flex
                  items-center
                  gap-1.5
                "
              >
                <span
                  className={`
                    h-1.5
                    w-1.5
                    rounded-full

                    ${
                      isUnread
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }
                  `}
                />

                <span
                  className="
                    text-[10px]
                    font-medium
                    text-slate-500
                  "
                >
                  {isUnread
                    ? "Unread"
                    : status ===
                        "Archived"
                      ? "Archived"
                      : "Conversation"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}

          <div
            className="
              ml-3
              flex
              shrink-0
              items-center
              gap-0.5
            "
          >
            {/* SEARCH */}

            <button
              type="button"
              onClick={() => {
                setSearchOpen(
                  (value) => !value
                );

                setMoreOpen(false);
              }}
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                transition

                ${
                  searchOpen
                    ? `
                      bg-white/[0.08]
                      text-white
                    `
                    : `
                      text-slate-500
                      hover:bg-white/[0.05]
                      hover:text-slate-200
                    `
                }
              `}
              title="Search messages"
            >
              <FiSearch className="h-[18px] w-[18px]" />
            </button>

            {/* MORE */}

            <button
              type="button"
              onClick={() => {
                setMoreOpen(
                  (value) => !value
                );

                setSearchOpen(false);
              }}
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                transition

                ${
                  moreOpen
                    ? `
                      bg-white/[0.08]
                      text-white
                    `
                    : `
                      text-slate-500
                      hover:bg-white/[0.05]
                      hover:text-slate-200
                    `
                }
              `}
              title="More"
            >
              <FiMoreVertical className="h-[18px] w-[18px]" />
            </button>

            {/* CLOSE */}

            <button
              type="button"
              onClick={handleClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                text-slate-500

                transition

                hover:bg-white/[0.06]
                hover:text-white

                active:scale-95
              "
              title="Close"
            >
              <FiX className="h-[18px] w-[18px]" />
            </button>
          </div>

          {/* =================================================
              MORE MENU
          ================================================= */}

          {moreOpen && (
            <div
              className="
                absolute
                right-3
                top-[60px]
                z-[200]

                w-[205px]

                overflow-hidden

                rounded-2xl

                border
                border-white/[0.09]

                bg-[#111827]

                p-1.5

                shadow-[0_25px_70px_rgba(0,0,0,.55)]
              "
            >
              {/* MARK READ */}

              <button
                type="button"
                onClick={() => {
                  onMarkRead?.();
                  setMoreOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-left

                  text-xs
                  font-medium
                  text-slate-300

                  transition

                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <FiCheckCircle
                  className="
                    h-4
                    w-4
                    text-emerald-400
                  "
                />

                {isUnread
                  ? "Mark as read"
                  : "Mark as unread"}
              </button>

              {/* MARK REPLIED */}

              <button
                type="button"
                onClick={() => {
                  onMarkReplied?.();
                  setMoreOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-left

                  text-xs
                  font-medium
                  text-slate-300

                  transition

                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <FiCheck
                  className="
                    h-4
                    w-4
                    text-sky-400
                  "
                />

                Mark as replied
              </button>

              <button
                type="button"
                onClick={() => {
                  onResolve?.();
                  setMoreOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-medium
                  text-slate-300
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <FiCheckCircle className="h-4 w-4 text-orange-300" />

                {status === "Resolved"
                  ? "Reopen conversation"
                  : "Resolve conversation"}
              </button>

              <div
                className="
                  my-1.5
                  h-px
                  bg-white/[0.06]
                "
              />

              {/* PRIORITY */}

              <div className="px-2 py-1.5">
                <div
                  className="
                    mb-2

                    px-1

                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]

                    text-slate-600
                  "
                >
                  Priority
                </div>

                <div className="relative">
                  <select
                    value={priority}
                    onChange={(event) => {
                      onPriorityChange?.(
                        event.target.value
                      );

                      setMoreOpen(false);
                    }}
                    className="
                      w-full
                      appearance-none

                      rounded-xl

                      border
                      border-white/[0.08]

                      bg-[#080e19]

                      px-3
                      py-2.5
                      pr-8

                      text-xs
                      font-medium
                      text-slate-300

                      outline-none
                    "
                  >
                    <option value="Normal">
                      Normal
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>

                  <FiChevronDown
                    className="
                      pointer-events-none

                      absolute
                      right-3
                      top-1/2

                      h-3.5
                      w-3.5

                      -translate-y-1/2

                      text-slate-500
                    "
                  />
                </div>
              </div>

              <div
                className="
                  my-1.5
                  h-px
                  bg-white/[0.06]
                "
              />

              {/* ARCHIVE */}

              <button
                type="button"
                onClick={() => {
                  onArchive?.();
                  setMoreOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-left

                  text-xs
                  font-medium
                  text-slate-300

                  transition

                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <FiArchive
                  className="
                    h-4
                    w-4
                    text-slate-400
                  "
                />

                {message.archived
                  ? "Restore conversation"
                  : "Archive conversation"}
              </button>

              {/* DELETE */}

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onDelete?.();
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3
                  py-2.5

                  text-left

                  text-xs
                  font-medium
                  text-red-400

                  transition

                  hover:bg-red-500/[0.08]
                "
              >
                <FiTrash2 className="h-4 w-4" />

                Delete conversation
              </button>
            </div>
          )}
        </header>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <div
          className={`
            shrink-0
            overflow-hidden

            border-b
            border-white/[0.06]

            bg-[#090f1a]

            transition-all
            duration-200

            ${
              searchOpen
                ? "max-h-[62px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div
            className="
              flex
              items-center
              gap-2

              px-4
              py-2.5
            "
          >
            <FiSearch
              className="
                h-4
                w-4
                shrink-0
                text-slate-600
              "
            />

            <input
              autoFocus={searchOpen}
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search messages..."
              className="
                min-w-0
                flex-1

                bg-transparent

                text-xs
                text-slate-200

                outline-none

                placeholder:text-slate-600
              "
            />

            {searchText && (
              <span
                className="
                  rounded-full

                  bg-white/[0.05]

                  px-2
                  py-1

                  text-[9px]
                  font-medium

                  text-slate-500
                "
              >
                {
                  filteredConversation.length
                }
              </span>
            )}

            {searchText && (
              <button
                type="button"
                onClick={() =>
                  setSearchText("")
                }
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center

                  rounded-full

                  text-slate-500

                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            CHAT BODY
        ================================================= */}

        <main
          className="
            modern-chat-scroll

            relative

            min-h-0
            flex-1

            overflow-y-auto

            bg-[#070c16]

            px-3
            py-4

            sm:px-5
          "
        >
          {/* BACKGROUND PATTERN */}

          <div
            className="
              pointer-events-none

              absolute
              inset-0

              opacity-[0.025]

              [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.7)_1px,transparent_1px)]

              [background-size:30px_30px]
            "
          />

          <div
            className="
              relative
              z-10

              mx-auto
              max-w-[560px]
            "
          >
            {/* NO RESULTS */}

            {filteredConversation.length ===
            0 ? (
              <div
                className="
                  flex
                  min-h-[350px]

                  items-center
                  justify-center

                  text-center
                "
              >
                <div>
                  <div
                    className="
                      mx-auto

                      mb-3

                      flex
                      h-12
                      w-12

                      items-center
                      justify-center

                      rounded-full

                      border
                      border-white/[0.07]

                      bg-white/[0.025]

                      text-slate-600
                    "
                  >
                    <FiSearch className="h-5 w-5" />
                  </div>

                  <p
                    className="
                      text-xs
                      font-medium
                      text-slate-400
                    "
                  >
                    No messages found
                  </p>

                  <p
                    className="
                      mt-1

                      text-[10px]

                      text-slate-600
                    "
                  >
                    Try another search.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredConversation.map(
                  (item, index) => {
                    const isAdmin =
                      item.type === "admin";

                    const currentDay =
                      getDayKey(
                        item.createdAt
                      );

                    const previousDay =
                      index > 0
                        ? getDayKey(
                            filteredConversation[
                              index - 1
                            ]?.createdAt
                          )
                        : null;

                    const showDate =
                      currentDay !==
                      previousDay;

                    const replyId =
                      item._id ||
                      item.id ||
                      item.uniqueId;

                    const isMenuOpen =
                      openMessageMenu ===
                      replyId;

                    const text =
                      item.message ||
                      item.body ||
                      "";

                    return (
                      <div
                        key={item.uniqueId}
                        className="
                          relative
                        "
                      >
                        {/* DATE */}

                        {showDate && (
                          <div
                            className="
                              flex
                              items-center
                              justify-center

                              py-4
                            "
                          >
                            <span
                              className="
                                rounded-lg

                                border
                                border-white/[0.07]

                                bg-[#101827]

                                px-2.5
                                py-1

                                text-[9px]
                                font-semibold

                                text-slate-500
                              "
                            >
                              {formatDate(
                                item.createdAt
                              )}
                            </span>
                          </div>
                        )}

                        {/* =================================
                            CUSTOMER
                        ================================= */}

                        {!isAdmin && (
                          <div
                            className="
                              mb-1.5

                              flex
                              justify-start
                            "
                          >
                            <div
                              className="
                                max-w-[84%]

                                sm:max-w-[74%]
                              "
                              style={{
                                animation:
                                  "chatMessage 180ms ease-out",
                              }}
                            >
                              <div
                                className="
                                  rounded-2xl
                                  rounded-tl-[5px]

                                  border
                                  border-white/[0.055]

                                  bg-[#151d2d]

                                  px-3.5
                                  py-2.5

                                  shadow-[0_3px_12px_rgba(0,0,0,.14)]
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-end
                                    gap-2
                                  "
                                >
                                  <p
                                    className="
                                      min-w-0
                                      flex-1

                                      whitespace-pre-wrap
                                      break-words

                                      text-[13px]
                                      leading-[1.5]

                                      text-slate-200
                                    "
                                  >
                                    {text}
                                  </p>

                                  <span
                                    className="
                                      shrink-0

                                      pb-0.5

                                      text-[9px]

                                      text-slate-600
                                    "
                                  >
                                    {formatTime(
                                      item.createdAt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* =================================
                            ADMIN
                        ================================= */}

                        {isAdmin && (
                          <div
                            className="
                              mb-1.5

                              flex
                              justify-end
                            "
                          >
                            <div
                              className="
                                group

                                relative

                                max-w-[84%]

                                sm:max-w-[74%]
                              "
                              style={{
                                animation:
                                  "chatMessage 180ms ease-out",
                              }}
                            >
                              <div
                                className={`
                                  relative

                                  rounded-2xl
                                  rounded-tr-[5px]

                                  border

                                  px-3.5
                                  py-2.5

                                  shadow-[0_3px_12px_rgba(0,0,0,.16)]

                                  ${
                                    item.deleted
                                      ? `
                                        border-red-400/[0.08]
                                        bg-[#17151b]
                                      `
                                      : `
                                        border-amber-400/[0.09]
                                        bg-[#211b18]
                                      `
                                  }
                                `}
                              >
                                <div
                                  className="
                                    flex
                                    items-end
                                    gap-2
                                  "
                                >
                                  <p
                                    className={`
                                      min-w-0
                                      flex-1

                                      whitespace-pre-wrap
                                      break-words

                                      text-[13px]
                                      leading-[1.5]

                                      ${
                                        item.deleted
                                          ? "italic text-slate-500"
                                          : "text-slate-100"
                                      }
                                    `}
                                  >
                                    {item.deleted
                                      ? "This message was deleted."
                                      : text}
                                  </p>

                                  <div
                                    className="
                                      flex
                                      shrink-0
                                      items-center
                                      gap-1

                                      pb-0.5
                                    "
                                  >
                                    <span
                                      className="
                                        text-[9px]

                                        text-slate-500
                                      "
                                    >
                                      {formatTime(
                                        item.createdAt
                                      )}
                                    </span>

                                    {!item.deleted && (
                                      <FiCheck
                                        className="
                                          h-3
                                          w-3

                                          text-amber-400/80
                                        "
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* EDITED */}

                              {item.edited &&
                                !item.deleted && (
                                  <div
                                    className="
                                      mt-0.5

                                      text-right

                                      text-[8px]

                                      text-slate-600
                                    "
                                  >
                                    Edited
                                  </div>
                                )}

                              {/* MESSAGE ACTION BUTTON */}

                              {!item.deleted && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenMessageMenu(
                                        isMenuOpen
                                          ? null
                                          : replyId
                                      )
                                    }
                                    className="
                                      absolute

                                      -left-8
                                      bottom-1

                                      flex
                                      h-6
                                      w-6

                                      items-center
                                      justify-center

                                      rounded-full

                                      border
                                      border-white/[0.07]

                                      bg-[#111827]

                                      text-slate-500

                                      opacity-0

                                      shadow-lg

                                      transition

                                      hover:text-white

                                      group-hover:opacity-100
                                    "
                                  >
                                    <FiMoreVertical className="h-3.5 w-3.5" />
                                  </button>

                                  {/* ACTION MENU */}

                                  {isMenuOpen && (
                                    <div
                                      className="
                                        absolute
                                        right-full
                                        bottom-0

                                        z-[100]

                                        mr-2

                                        w-[135px]

                                        overflow-hidden

                                        rounded-xl

                                        border
                                        border-white/[0.08]

                                        bg-[#111827]

                                        p-1

                                        shadow-[0_18px_55px_rgba(0,0,0,.5)]
                                      "
                                    >
                                      {/* EDIT */}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditReply(
                                            item
                                          )
                                        }
                                        className="
                                          flex
                                          w-full
                                          items-center
                                          gap-2

                                          rounded-lg

                                          px-2.5
                                          py-2

                                          text-left

                                          text-[10px]
                                          font-medium

                                          text-slate-300

                                          hover:bg-white/[0.05]
                                          hover:text-white
                                        "
                                      >
                                        <FiEdit2 className="h-3.5 w-3.5" />

                                        Edit
                                      </button>

                                      {/* COPY */}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCopyReply(
                                            item
                                          )
                                        }
                                        className="
                                          flex
                                          w-full
                                          items-center
                                          gap-2

                                          rounded-lg

                                          px-2.5
                                          py-2

                                          text-left

                                          text-[10px]
                                          font-medium

                                          text-slate-300

                                          hover:bg-white/[0.05]
                                          hover:text-white
                                        "
                                      >
                                        <FiCopy className="h-3.5 w-3.5" />

                                        {copiedReplyId ===
                                        replyId
                                          ? "Copied"
                                          : "Copy"}
                                      </button>

                                      <div
                                        className="
                                          my-1

                                          h-px

                                          bg-white/[0.06]
                                        "
                                      />

                                      {/* DELETE */}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMessageMenu(
                                            null
                                          );

                                          setDeleteReplyId(
                                            replyId
                                          );
                                        }}
                                        className="
                                          flex
                                          w-full
                                          items-center
                                          gap-2

                                          rounded-lg

                                          px-2.5
                                          py-2

                                          text-left

                                          text-[10px]
                                          font-medium

                                          text-red-400

                                          hover:bg-red-500/[0.08]
                                        "
                                      >
                                        <FiTrash2 className="h-3.5 w-3.5" />

                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                <div
                  ref={messagesEndRef}
                  className="h-1"
                />
              </div>
            )}
          </div>
        </main>

        {/* =================================================
            ALWAYS VISIBLE COMPOSER
        ================================================= */}

        <footer
          className="
            shrink-0

            border-t
            border-white/[0.07]

            bg-[#0a101c]

            px-3
            py-3

            sm:px-4
          "
        >
          <div
            className="
              mx-auto
              max-w-[560px]
            "
          >
            <div
              className={`
                flex
                items-end
                gap-2

                rounded-[22px]

                border

                bg-[#111927]

                px-2
                py-2

                transition

                ${
                  replyText.trim()
                    ? `
                      border-amber-400/[0.18]
                      shadow-[0_0_0_3px_rgba(245,158,11,.025)]
                    `
                    : `
                      border-white/[0.07]
                    `
                }
              `}
            >
              {/* TEXTAREA */}

              <textarea
                ref={replyInputRef}
                value={replyText}
                onChange={(event) =>
                  onReplyChange?.(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent
                      .isComposing
                  ) {
                    event.preventDefault();

                    handleSendReply();
                  }
                }}
                rows={1}
                maxLength={1200}
                placeholder="Type a message"
                className="
                  modern-textarea

                  max-h-[120px]
                  min-h-[38px]

                  flex-1

                  resize-none

                  bg-transparent

                  px-2
                  py-2

                  text-[13px]
                  leading-5

                  text-slate-100

                  outline-none

                  placeholder:text-slate-600
                "
              />

              {/* SEND */}

              <button
                type="button"
                onClick={handleSendReply}
                disabled={
                  !replyText.trim() ||
                  replySending
                }
                className="
                  flex
                  h-9
                  w-9
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-amber-400

                  text-slate-950

                  shadow-[0_6px_18px_rgba(245,158,11,.13)]

                  transition

                  hover:bg-amber-300

                  active:scale-95

                  disabled:
                    cursor-not-allowed

                  disabled:opacity-25
                "
                title="Send"
              >
                {replySending ? (
                  <span
                    className="
                      h-4
                      w-4

                      animate-spin

                      rounded-full

                      border-2
                      border-slate-950/25
                      border-t-slate-950
                    "
                  />
                ) : (
                  <FiSend className="h-4 w-4" />
                )}
              </button>
            </div>

            <div
              className="
                mt-1.5

                flex
                justify-between

                px-2
              "
            >
              <span
                className="
                  text-[8px]
                  text-slate-700
                "
              >
                Shift + Enter for new line
              </span>

              <span
                className="
                  text-[8px]
                  tabular-nums

                  text-slate-700
                "
              >
                {replyText.length}/1200
              </span>
            </div>
          </div>
        </footer>
      </aside>

      {/* ===================================================
          EDIT MESSAGE MODAL
      =================================================== */}

      {editingReplyId &&
        editingReply && (
          <div
            className="
              fixed
              inset-0
              z-[200]

              flex
              items-center
              justify-center

              bg-black/65

              px-4

              backdrop-blur-md
            "
            onClick={cancelEditReply}
          >
            <div
              className="
                w-full
                max-w-[460px]

                overflow-hidden

                rounded-[22px]

                border
                border-white/[0.09]

                bg-[#101827]

                shadow-[0_30px_100px_rgba(0,0,0,.65)]
              "
              style={{
                animation:
                  "modalScale 180ms ease-out",
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* HEADER */}

              <div
                className="
                  flex
                  items-center
                  justify-between

                  border-b
                  border-white/[0.07]

                  px-5
                  py-4
                "
              >
                <div>
                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    Edit message
                  </h3>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-600
                    "
                  >
                    Update your message
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEditReply}
                  disabled={editSaving}
                  className="
                    flex
                    h-8
                    w-8

                    items-center
                    justify-center

                    rounded-full

                    text-slate-500

                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              {/* BODY */}

              <div className="p-5">
                <textarea
                  autoFocus
                  value={editingText}
                  onChange={(event) =>
                    setEditingText(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (
                        editingText.trim()
                      ) {
                        saveEditedReply();
                      }
                    }
                  }}
                  rows={5}
                  maxLength={1200}
                  disabled={editSaving}
                  className="
                    modern-chat-scroll

                    min-h-[130px]

                    w-full

                    resize-none

                    rounded-2xl

                    border
                    border-white/[0.08]

                    bg-[#080e19]

                    px-3.5
                    py-3

                    text-[13px]
                    leading-6

                    text-slate-200

                    outline-none

                    placeholder:text-slate-600

                    focus:border-amber-400/20
                    focus:ring-4
                    focus:ring-amber-400/[0.035]
                  "
                  placeholder="Edit message..."
                />

                <div
                  className="
                    mt-2

                    flex
                    justify-end
                  "
                >
                  <span
                    className="
                      text-[9px]
                      tabular-nums

                      text-slate-600
                    "
                  >
                    {editingText.length}/1200
                  </span>
                </div>

                <div
                  className="
                    mt-5

                    flex
                    justify-end
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={cancelEditReply}
                    disabled={editSaving}
                    className="
                      rounded-xl

                      border
                      border-white/[0.08]

                      px-4
                      py-2.5

                      text-[11px]
                      font-semibold

                      text-slate-400

                      hover:bg-white/[0.04]
                      hover:text-white
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveEditedReply}
                    disabled={
                      !editingText.trim() ||
                      editSaving
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2

                      rounded-xl

                      bg-amber-400

                      px-4
                      py-2.5

                      text-[11px]
                      font-bold

                      text-slate-950

                      hover:bg-amber-300

                      disabled:opacity-30
                    "
                  >
                    {editSaving ? (
                      <span
                        className="
                          h-3.5
                          w-3.5

                          animate-spin

                          rounded-full

                          border-2
                          border-slate-950/25
                          border-t-slate-950
                        "
                      />
                    ) : (
                      <FiCheck className="h-3.5 w-3.5" />
                    )}

                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ===================================================
          DELETE MESSAGE MODAL
      =================================================== */}

      {deleteReplyId && (
        <div
          className="
            fixed
            inset-0
            z-[210]

            flex
            items-center
            justify-center

            bg-black/65

            px-4

            backdrop-blur-md
          "
          onClick={() =>
            !deleteSaving &&
            setDeleteReplyId(null)
          }
        >
          <div
            className="
              w-full
              max-w-[370px]

              rounded-[22px]

              border
              border-white/[0.09]

              bg-[#101827]

              p-5

              shadow-[0_30px_100px_rgba(0,0,0,.65)]
            "
            style={{
              animation:
                "modalScale 180ms ease-out",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                flex
                items-start
                gap-3.5
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0

                  items-center
                  justify-center

                  rounded-xl

                  bg-red-500/[0.08]

                  text-red-400
                "
              >
                <FiTrash2 className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h3
                  className="
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Delete message?
                </h3>

                <p
                  className="
                    mt-1.5

                    text-xs
                    leading-5

                    text-slate-500
                  "
                >
                  This message will be removed
                  from the conversation.
                </p>
              </div>
            </div>

            <div
              className="
                mt-5

                flex
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                onClick={() =>
                  setDeleteReplyId(null)
                }
                disabled={deleteSaving}
                className="
                  rounded-xl

                  border
                  border-white/[0.08]

                  px-4
                  py-2.5

                  text-[11px]
                  font-semibold

                  text-slate-400

                  hover:bg-white/[0.04]
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteReply
                }
                disabled={deleteSaving}
                className="
                  inline-flex
                  items-center
                  gap-2

                  rounded-xl

                  bg-red-500

                  px-4
                  py-2.5

                  text-[11px]
                  font-bold

                  text-white

                  transition

                  hover:bg-red-400

                  disabled:opacity-40
                "
              >
                {deleteSaving && (
                  <span
                    className="
                      h-3.5
                      w-3.5

                      animate-spin

                      rounded-full

                      border-2
                      border-white/25
                      border-t-white
                    "
                  />
                )}

                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactDetailsDrawer;