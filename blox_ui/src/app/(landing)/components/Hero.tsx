'use client';

import { FeatherArrowUp, FeatherSendHorizontal } from '@subframe/core';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { TextArea } from '@/components/ui/TextArea';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import SectionLayout from '@/layouts/SectionLayout';
import Logo from '@/components/ui/Logo';
import { IconButton } from '@/components/ui/IconButton';

const Hero = () => {
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const suggestedTopics = [
    'Rise of 5G technology',
    'Impact of IoT on daily life',
    'Evolution of cybersecurity',
  ];

  const baseText = 'Write a blog on ';

  useEffect(() => {
    if (isInputFocused) return;

    const typingSpeed = 50;
    const deletingSpeed = 50;
    const pauseDuration = 2000;

    const currentTopic = suggestedTopics[currentTopicIndex];

    const timer = setTimeout(
      () => {
        if (isDeleting) {
          if (currentCharIndex > 0) {
            setCurrentCharIndex((prev) => prev - 1);
          } else {
            setIsDeleting(false);
            setCurrentTopicIndex((prev) => (prev + 1) % suggestedTopics.length);
          }
        } else {
          if (currentCharIndex < currentTopic.length) {
            setCurrentCharIndex((prev) => prev + 1);
          } else {
            setTimeout(() => setIsDeleting(true), pauseDuration);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [currentCharIndex, currentTopicIndex, isDeleting, isInputFocused]);

  const dynamicPlaceholder =
    baseText + suggestedTopics[currentTopicIndex].slice(0, currentCharIndex);

  const handleTopicClick = (topic: string) => {
    setSelectedPrompt(baseText + topic);
  };

  return (
    <SectionLayout>
      <Logo size={120} />
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="font-['Inter'] text-[48px] font-[400] leading-[48px] text-default-font">
          Share ideas, build trust, and spark connections.
        </span>
        <span className="text-heading-3 font-body text-subtext-color">
          We help you create smart, engaging content effortlessly
        </span>
      </div>
      <div className="lg:px-20 flex w-full flex-col items-center gap-4">
        <div className="flex w-full max-w-[40rem] items-center gap-4 relative border border-neutral-border rounded-lg">
          <TextArea.Input
            placeholder={dynamicPlaceholder}
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            className="resize-none mb-9 min-h-3"
            rows={1}
          />
          <IconButton
            icon={<FeatherSendHorizontal />}
            className="absolute right-2 bottom-2 cursor-pointer hover:bg-brand-200"
            onClick={() => {
              setLoading(true);
              router.push('/signin')
            }}
          />
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 px-3 justify-center">
          {suggestedTopics.map((topic, ind) => (
            <Button
              key={ind}
              variant="brand-secondary"
              iconRight={<FeatherArrowUp />}
              onClick={() => handleTopicClick(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
    </SectionLayout>
  );
};

export default Hero;
