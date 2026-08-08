import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { FiX, FiZap, FiCheck } from "react-icons/fi";

export default function RaceInviteToast() {
  const { raceInvites, dismissInvite, socketRef } = useSocket();
  const navigate = useNavigate();

  const handleAccept = useCallback(
    (invite) => {
      const username = window.localStorage.getItem("growtyping.username");
      if (socketRef?.current) {
        socketRef.current.emit("accept-invite", {
          username,
          code: invite.code,
        });
      }
      dismissInvite(invite.id);
      navigate(`/race?join=${invite.code}`);
    },
    [socketRef, dismissInvite, navigate]
  );

  const handleReject = useCallback(
    (invite) => {
      const username = window.localStorage.getItem("growtyping.username");
      if (socketRef?.current) {
        socketRef.current.emit("reject-invite", {
          fromUsername: invite.fromUsername,
          toUsername: username,
        });
      }
      dismissInvite(invite.id);
    },
    [socketRef, dismissInvite]
  );

  if (!raceInvites.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        pointerEvents: "none",
      }}
    >
      {raceInvites.map((invite) => (
        <div
          key={invite.id}
          style={{ pointerEvents: "all" }}
          className="race-invite-toast"
        >
          {/* Glow pulse ring */}
          <div className="race-toast-ring" />

          <div className="race-toast-inner">
            {/* Header */}
            <div className="race-toast-header">
              {/* <div className="race-toast-icon">
                <FiZap size={14} />
              </div> */}
              <span className="race-toast-label">Race Invitation</span>
              <button
                className="race-toast-close"
                onClick={() => dismissInvite(invite.id)}
                title="Dismiss"
              >
                <FiX size={13} />
              </button>
            </div>

            {/* Message */}
            <p className="race-toast-message">
              <span className="race-toast-user">{invite.fromUsername}</span>
              {" invited you to a race!"}
            </p>

            <p className="race-toast-code">
              Room: <code>{invite.code}</code>
            </p>

            {/* Actions */}
            <div className="race-toast-actions">
              <button
                className="race-toast-btn race-toast-accept"
                onClick={() => handleAccept(invite)}
              >
                <FiCheck size={13} />
                Accept
              </button>
              <button
                className="race-toast-btn race-toast-reject"
                onClick={() => handleReject(invite)}
              >
                <FiX size={13} />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .race-invite-toast {
          position: relative;
          min-width: 300px;
          max-width: 340px;
          animation: raceToastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        @keyframes raceToastIn {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }

        .race-toast-ring {
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          background: conic-gradient(from 0deg, #f59e0b, #ef4444, #10b981, #f59e0b);
          animation: raceRingSpin 2s linear infinite;
          opacity: 0.75;
          z-index: 0;
        }

        @keyframes raceRingSpin {
          to { transform: rotate(360deg); }
        }

        .race-toast-inner {
          position: relative;
          z-index: 1;
          background: rgba(22, 19, 15, 0.97);
          border-radius: 14px;
          padding: 1rem 1.1rem;
          border: 1px solid rgba(245, 158, 11, 0.35);
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(245, 158, 11, 0.2);
        }

        .race-toast-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        .race-toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .race-toast-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #f59e0b;
          flex: 1;
        }

        .race-toast-close {
          background: none;
          border: none;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          padding: 2px;
          line-height: 1;
          transition: color 0.15s;
        }
        .race-toast-close:hover { color: rgba(255,255,255,0.7); }

        .race-toast-message {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.85);
          margin: 0 0 0.3rem;
          line-height: 1.4;
        }

        .race-toast-user {
          font-weight: 700;
          color: #fbbf24;
        }

        .race-toast-code {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.45);
          margin: 0 0 0.8rem;
        }
        .race-toast-code code {
          background: rgba(245, 158, 11, 0.12);
          padding: 1px 6px;
          border-radius: 4px;
          font-family: monospace;
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.25);
          letter-spacing: 0.12em;
        }

        .race-toast-actions {
          display: flex;
          gap: 0.5rem;
        }

        .race-toast-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.45rem 0;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
        }

        .race-toast-accept {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 14px rgba(16,185,129,0.35);
        }
        .race-toast-accept:hover {
          background: linear-gradient(135deg, #34d399, #10b981);
          box-shadow: 0 6px 20px rgba(16,185,129,0.5);
          transform: translateY(-1px);
        }

        .race-toast-reject {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .race-toast-reject:hover {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          border-color: rgba(239,68,68,0.3);
        }
      `}</style>
    </div>
  );
}
