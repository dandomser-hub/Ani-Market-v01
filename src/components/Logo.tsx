import { Leaf } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}

export default function Logo({ size = 'md', light = false }: Props) {
  const sizes = {
    sm: { icon: 18, text: 'text-base', gap: 'gap-1.5' },
    md: { icon: 24, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 32, text: 'text-2xl', gap: 'gap-2.5' },
  };
  const s = sizes[size];
  const textColor = light ? 'text-white' : 'text-green-800';
  const iconBg = light ? 'bg-white/20' : 'bg-green-600';
  const iconColor = light ? 'text-white' : 'text-white';

  return (
    <div className={`flex items-center ${s.gap}`}>
      <div className={`${iconBg} rounded-lg p-1.5 flex items-center justify-center`}>
        <Leaf size={s.icon} className={iconColor} />
      </div>
      <span className={`font-bold ${s.text} ${textColor} tracking-tight`}>
        Ani Market
      </span>
    </div>
  );
}
