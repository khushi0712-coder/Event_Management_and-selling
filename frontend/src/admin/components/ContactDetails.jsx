import {
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiMoreVertical,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const priorityOptions = ["Normal", "Important", "Urgent"];

const getInitial = (name = "") =>
  name.trim().charAt(0).toUpperCase() || "C";

const formatTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ContactDetails = ({
  contact,
  metadata = {},

  onClose,
  onMarkRead,
  onMarkReplied,
  onPriorityChange,
  onDelete,

  replyText = "",
  onReplyChange,
  onReplySend,
  replySending = false,

  /* Keep for compatibility with parent.
     IMPORTANT: do NOT use this to disable reply. */
  replySupported,
}) => {
  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center bg-[#070c16] text-sm text-slate-500">
        Select a conversation
      </div>
    );
  }

  const name = contact.name || "Unknown user";

  const initials = getInitial(name);

  const status =
    metadata.status ||
    (metadata.read ? "Read" : "Unread");

  const priority =
    metadata.priority || "Normal";

  const content =
    contact.message ||
    "No message available.";

  const isUnread = status === "Unread";

  /* =====================================================
     SEND REPLY
  ===================================================== */

  const handleSendReply = async () => {
    const text = replyText.trim();

    if (!text || replySending) return;

    /*
      IMPORTANT:
      We intentionally DO NOT check replySupported.
      If parent has onReplySend, it will execute.
    */

    if (typeof onReplySend !== "function") {
      console.error(
        "ContactDetails: onReplySend callback is missing."
      );
      return;
    }

    try {
      const result = await onReplySend();

      /*
        Parent can return false when API fails.
        In that case keep the typed message.
      */
      if (result === false) return;

      onReplyChange?.("");
    } catch (error) {
      console.error("Reply failed:", error);
    }
  };

  /* =====================================================
     ENTER TO SEND
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSendReply();
    }
  };

  return (
    <>
      <style>
        {`
          .contact-scroll::-webkit-scrollbar {
            width: 5px;
          }

          .contact-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .contact-scroll::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.18);
            border-radius: 999px;
          }

          .contact-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(148,163,184,.18) transparent;
          }

          .reply-scroll::-webkit-scrollbar {
            width: 4px;
          }

          .reply-scroll::-webkit-scrollbar-thumb {
            background: rgba(148,163,184,.2);
            border-radius: 999px;
          }
        `}
      </style>

      {/* ===================================================
          MAIN CONTAINER
      =================================================== */}

      <section
        className="
          flex
          h-full
          min-h-0
          w-full
          flex-col
          overflow-hidden

          rounded-[24px]

          border
          border-white/[0.08]

          bg-[#070c16]

          text-white

          shadow-[0_25px_80px_rgba(0,0,0,.35)]
        "
      >

        {/* =================================================
            TOP HEADER
            ONLY ONE HEADER
        ================================================= */}

        <header
          className="
            flex
            h-[76px]
            shrink-0

            items-center
            justify-between

            border-b
            border-white/[0.07]

            bg-[#0a111d]

            px-5
          "
        >
          {/* USER */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            {/* AVATAR */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0

                items-center
                justify-center

                rounded-xl

                bg-[#211b18]

                text-sm
                font-bold

                text-orange-300
              "
            >
              {initials}
            </div>

            {/* USER INFO */}

            <div className="min-w-0">
              <p
                className="
                  truncate

                  text-[15px]
                  font-semibold

                  text-white
                "
              >
                {name}
              </p>

              <p
                className="
                  mt-0.5

                  truncate

                  text-[11px]

                  text-slate-600
                "
              >
                {contact.email || ""}
              </p>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div
            className="
              flex
              items-center
              gap-1
            "
          >
            {/* MORE */}

            <details className="relative">
              <summary
                className="
                  flex
                  h-9
                  w-9

                  cursor-pointer
                  list-none

                  items-center
                  justify-center

                  rounded-full

                  text-slate-500

                  transition

                  hover:bg-white/[0.05]
                  hover:text-white

                  [&::-webkit-details-marker]:hidden
                "
              >
                <FiMoreVertical className="h-[17px] w-[17px]" />
              </summary>

              <div
                className="
                  absolute
                  right-0
                  top-11
                  z-[100]

                  w-[205px]

                  rounded-2xl

                  border
                  border-white/[0.08]

                  bg-[#101827]

                  p-1.5

                  shadow-[0_20px_60px_rgba(0,0,0,.5)]
                "
              >

                {/* MARK READ */}

                <button
                  type="button"
                  onClick={onMarkRead}
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

                {/* REPLIED */}

                <button
                  type="button"
                  onClick={onMarkReplied}
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

                <div
                  className="
                    my-1.5
                    h-px
                    bg-white/[0.06]
                  "
                />

                {/* PRIORITY */}

                <div className="relative px-1 py-1">
                  <select
                    value={priority}
                    onChange={(event) =>
                      onPriorityChange?.(
                        event.target.value
                      )
                    }
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
                      text-slate-300

                      outline-none
                    "
                  >
                    {priorityOptions.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                          className="bg-[#080e19]"
                        >
                          {option}
                        </option>
                      )
                    )}
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

                      text-slate-600
                    "
                  />
                </div>

                <div
                  className="
                    my-1.5
                    h-px
                    bg-white/[0.06]
                  "
                />

                {/* DELETE */}

                <button
                  type="button"
                  onClick={onDelete}
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

                    text-red-400

                    transition

                    hover:bg-red-500/[0.08]
                  "
                >
                  <FiTrash2 className="h-4 w-4" />

                  Delete message
                </button>
              </div>
            </details>

            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
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
              "
            >
              <FiX className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* =================================================
            CHAT
        ================================================= */}

        <main
          className="
            contact-scroll

            min-h-0
            flex-1

            overflow-y-auto

            px-5
            py-5
          "
        >
          <div className="mx-auto max-w-[650px]">

            {/* DATE */}

            <div
              className="
                mb-7

                flex
                justify-center
              "
            >
              <span
                className="
                  rounded-lg

                  border
                  border-white/[0.07]

                  bg-[#111a29]

                  px-3
                  py-1

                  text-[9px]
                  font-medium

                  text-slate-500
                "
              >
                {formatDate(contact.createdAt)}
              </span>
            </div>

            {/* CUSTOMER MESSAGE */}

            <div
              className="
                flex
                justify-start
              "
            >
              <div
                className="
                  max-w-[80%]
                "
              >

                {/* SMALL NAME */}

                <p
                  className="
                    mb-1.5
                    ml-1

                    text-[9px]

                    text-slate-600
                  "
                >
                  {name}
                </p>

                {/* BUBBLE */}

                <div
                  className="
                    rounded-2xl
                    rounded-tl-[5px]

                    border
                    border-white/[0.06]

                    bg-[#151f30]

                    px-4
                    py-3

                    shadow-[0_5px_20px_rgba(0,0,0,.15)]
                  "
                >
                  <div
                    className="
                      flex
                      items-end
                      gap-3
                    "
                  >
                    <p
                      className="
                        whitespace-pre-wrap
                        break-words

                        text-[13px]
                        leading-[1.6]

                        text-slate-100
                      "
                    >
                      {content}
                    </p>

                    <span
                      className="
                        shrink-0

                        text-[9px]

                        text-slate-600
                      "
                    >
                      {formatTime(
                        contact.createdAt
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXISTING REPLIES */}

            {Array.isArray(contact.replies) &&
              contact.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {contact.replies.map(
                    (reply, index) => (
                      <div
                        key={
                          reply._id ||
                          reply.id ||
                          index
                        }
                        className="
                          flex
                          justify-end
                        "
                      >
                        <div
                          className="
                            max-w-[80%]

                            rounded-2xl
                            rounded-tr-[5px]

                            border
                            border-orange-400/[0.10]

                            bg-[#251e1a]

                            px-4
                            py-3
                          "
                        >
                          <div
                            className="
                              flex
                              items-end
                              gap-3
                            "
                          >
                            <p
                              className="
                                whitespace-pre-wrap
                                break-words

                                text-[13px]
                                leading-[1.6]

                                text-slate-100
                              "
                            >
                              {reply.message ||
                                reply.text ||
                                ""}
                            </p>

                            <span
                              className="
                                shrink-0

                                text-[9px]

                                text-slate-600
                              "
                            >
                              {formatTime(
                                reply.createdAt
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

          </div>
        </main>

        {/* =================================================
            REPLY COMPOSER
            ALWAYS AVAILABLE
        ================================================= */}

        <footer
          className="
            shrink-0

            border-t
            border-white/[0.07]

            bg-[#0a111d]

            px-4
            py-3
          "
        >
          <div
            className="
              mx-auto
              max-w-[650px]
            "
          >

            {/* COMPOSER */}

            <div
              className="
                flex
                items-end
                gap-2

                rounded-[20px]

                border
                border-white/[0.08]

                bg-[#111927]

                p-2

                transition

                focus-within:border-orange-400/[0.20]
                focus-within:ring-2
                focus-within:ring-orange-400/[0.04]
              "
            >
              {/* TEXT */}

              <textarea
                value={replyText}
                onChange={(event) =>
                  onReplyChange?.(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={1200}
                disabled={replySending}
                placeholder="Type a message..."
                className="
                  reply-scroll

                  min-h-[40px]
                  max-h-[120px]

                  flex-1

                  resize-none

                  bg-transparent

                  px-2.5
                  py-2

                  text-[13px]
                  leading-5

                  text-white

                  outline-none

                  placeholder:text-slate-600

                  disabled:opacity-50
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
                  h-10
                  w-10
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-orange-400

                  text-[#0b1018]

                  shadow-[0_5px_20px_rgba(251,146,60,.12)]

                  transition

                  hover:bg-orange-300

                  active:scale-95

                  disabled:
                    cursor-not-allowed

                  disabled:opacity-30
                "
                title="Send reply"
              >
                {replySending ? (
                  <span
                    className="
                      h-4
                      w-4

                      animate-spin

                      rounded-full

                      border-2
                      border-black/20
                      border-t-black
                    "
                  />
                ) : (
                  <FiSend className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* HINT */}

            <div
              className="
                mt-1.5

                flex
                items-center
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
                Enter to send · Shift + Enter
                for new line
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
      </section>
    </>
  );
};

export default ContactDetails;