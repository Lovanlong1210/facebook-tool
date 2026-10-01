import { ThumbsUp, MessageSquare, Share2, Globe2, MoreHorizontal, CheckCircle2 } from 'lucide-react';

export default function FacebookFeedPreview({
  pageName = 'Fanpage của bạn',
  content = '',
  mediaUrl = '',
  mediaType = 'image'
}) {
  return (
    <div className="fb-feed-card">
      {/* Header bài đăng */}
      <div className="fb-header">
        <div className="fb-avatar">
          {pageName ? pageName.charAt(0).toUpperCase() : 'F'}
        </div>
        <div className="fb-user-info">
          <div className="fb-name-row">
            <strong>{pageName || 'Fanpage Facebook'}</strong>
            <span className="fb-verified" title="Trang đã xác minh">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </span>
          </div>
          <div className="fb-time-row">
            <span>Vừa xong</span>
            <span>·</span>
            <Globe2 size={12} className="fb-globe" />
          </div>
        </div>
        <button type="button" className="fb-dots-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Nội dung text */}
      <div className="fb-content">
        {content ? (
          <p className="fb-text">{content}</p>
        ) : (
          <p className="fb-placeholder">Nội dung bài viết sẽ hiển thị tại đây theo thời gian thực...</p>
        )}
      </div>

      {/* Media hình ảnh hoặc video */}
      {mediaUrl && (
        <div className="fb-media-wrap">
          {mediaType === 'video' ? (
            <video src={mediaUrl} controls className="fb-media" />
          ) : (
            <img src={mediaUrl} alt="Media bài đăng" className="fb-media" />
          )}
        </div>
      )}

      {/* Thống kê tương tác */}
      <div className="fb-stats-row">
        <div className="fb-reactions">
          <span className="fb-reaction-icon like">👍</span>
          <span className="fb-reaction-icon heart">❤️</span>
          <span className="fb-reaction-count">1.8k</span>
        </div>
        <div className="fb-counts">
          <span>94 bình luận</span>
          <span>·</span>
          <span>28 lượt chia sẻ</span>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="fb-actions-row">
        <button type="button" className="fb-action-btn">
          <ThumbsUp size={16} />
          <span>Thích</span>
        </button>
        <button type="button" className="fb-action-btn">
          <MessageSquare size={16} />
          <span>Bình luận</span>
        </button>
        <button type="button" className="fb-action-btn">
          <Share2 size={16} />
          <span>Chia sẻ</span>
        </button>
      </div>

      <style jsx>{`
        .fb-feed-card {
          background: #ffffff;
          border: 1px solid #e4e6eb;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .fb-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          gap: 10px;
        }

        .fb-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1877F2 0%, #00C6FF 100%);
          color: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .fb-user-info {
          flex: 1;
          min-width: 0;
        }

        .fb-name-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
          color: #050505;
        }

        .fb-verified {
          display: inline-flex;
          align-items: center;
        }

        .fb-time-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #65676b;
          margin-top: 1px;
        }

        .fb-dots-btn {
          border: 0;
          background: transparent;
          color: #65676b;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
        }

        .fb-content {
          padding: 4px 16px 12px;
        }

        .fb-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
          color: #050505;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .fb-placeholder {
          margin: 0;
          font-size: 14px;
          color: #8a8d91;
          font-style: italic;
        }

        .fb-media-wrap {
          background: #f0f2f5;
          max-height: 380px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fb-media {
          width: 100%;
          max-height: 380px;
          object-fit: cover;
          display: block;
        }

        .fb-stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid #ced0d4;
          font-size: 13px;
          color: #65676b;
        }

        .fb-reactions {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .fb-reaction-icon {
          display: inline-flex;
          font-size: 13px;
        }

        .fb-reaction-count {
          margin-left: 4px;
        }

        .fb-actions-row {
          display: flex;
          padding: 4px 8px;
        }

        .fb-action-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 0;
          border: 0;
          background: transparent;
          color: #65676b;
          font-size: 13px;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .fb-action-btn:hover {
          background: #f0f2f5;
        }
      `}</style>
    </div>
  );
}
