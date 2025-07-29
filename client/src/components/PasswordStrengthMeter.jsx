import React from 'react';

function getStrength(password) {
  let score = 0;
  if (!password) return score;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return score;
}

const strengthLabels = [
  'Too short',
  'Weak',
  'Fair',
  'Good',
  'Strong',
  'Very strong',
];

export default function PasswordStrengthMeter({ password }) {
  const score = getStrength(password);
  const percent = (score / 5) * 100;
  const color = [
    'bg-gray-300',
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-green-400',
    'bg-emerald-600',
  ][score];

  return (
    <div className="mt-2">
      <div className="w-full h-2 rounded bg-gray-200">
        <div
          className={`h-2 rounded ${color}`}
          style={{ width: `${percent}%`, transition: 'width 0.3s' }}
        ></div>
      </div>
      <div className="text-xs mt-1 text-gray-600">
        {strengthLabels[score]}
      </div>
    </div>
  );
} 