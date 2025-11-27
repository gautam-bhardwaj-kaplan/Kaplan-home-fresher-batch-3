import type { OwnedBadge } from '../types';
import type { BaseBadge } from '../constants/badges';

interface BadgeCardProps {
  badge: BaseBadge;
  ownedBadge?: OwnedBadge;
}

export const BadgeCard = ({ badge, ownedBadge }: BadgeCardProps) => {
  const isUnlocked = Boolean(ownedBadge);
  const iconSrc = ownedBadge?.iconUrl || badge.icon;
  const iconContent = iconSrc ? (
    <img src={iconSrc} alt={`${badge.name} badge icon`} loading="lazy" />
  ) : (
    <span aria-hidden="true">{badge.name.charAt(0)}</span>
  );

  return (
    <div
      className={`profile-badge-card ${
        isUnlocked ? 'profile-badge-card-earned' : 'profile-badge-card-locked'
      }`}
      title={badge.description}
      aria-label={`${badge.name}${isUnlocked ? '' : ' (locked)'}`}
    >
      <div className="profile-badge-icon">{iconContent}</div>
      <p className="profile-badge-name">{badge.name}</p>
    </div>
  );
};

