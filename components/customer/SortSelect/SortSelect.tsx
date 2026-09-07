'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  current: string;
  options: { value: string; label: string }[];
  className?: string;
}

export default function SortSelect({ current, options, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <select
      id="sort-select"
      className={className || 'form-input form-select'}
      value={current}
      onChange={handleChange}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
