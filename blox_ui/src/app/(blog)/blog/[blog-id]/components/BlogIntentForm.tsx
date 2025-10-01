'use client';
import { useState } from 'react';
import * as SubframeCore from '@subframe/core';

import { TextField } from '@/components/ui/TextField';
import { Accordion } from '@/components/ui/Accordion';
import { TextArea } from '@/components/ui/TextArea';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Button } from '@/components/ui/Button';
import TooltipWrapper from '@/components/ui/TooltipWrapper';
import { showErrorToast } from '@/components/ui/ToastWrapper';

import { useBlogStore } from '@/stores/blogStore';
import { useApiClient } from '@/lib/api/useApiClient';
import { validateMinMaxRelation, validateTextField } from '@/src/lib/utils/validation';

const AccordianTitle = ({ title, tooltipText }: { title: string; tooltipText: string }) => {
  return (
    <div className="flex w-full items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-2 grow shrink-0 basis-0 text-body-bold font-body-bold text-default-font">
        <span>{title}</span>
        <TooltipWrapper tooltipText={tooltipText}>
          <SubframeCore.IconWrapper className="text-neutral-700">
            <SubframeCore.FeatherBadgeInfo />
          </SubframeCore.IconWrapper>
        </TooltipWrapper>
      </div>
      <Accordion.Chevron />
    </div>
  );
};

const BlogIntentForm = () => {
  const apiClient = useApiClient();
  const [customDesiredTone, setCustomDesiredTone] = useState('');
  const [customTargetAudience, setCustomTargetAudience] = useState('');

  const [blogMetadataForm, setBlogMetadataForm] = useState({
    title: '',
    description: '',
    targetAudience: '',
    desiredTone: '',
    blogLength: {
      min: 0,
      max: 0,
    },
    seoKeywords: '',
  });

  const addBlog = useBlogStore((state) => state.addBlog);
  const updateMarkdown = useBlogStore((state) => state.updateMarkdown);
  const blogLoading = useBlogStore((state) => state.blogLoading);
  const updateBlogLoading = useBlogStore((state) => state.updateBlogLoading);
  const setActiveBlogId = useBlogStore((state) => state.setActiveBlogId);
  const createBlog = useBlogStore((state) => state.createBlog);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { id, value } = event.target;

    if (id === 'min-words') {
      setBlogMetadataForm({
        ...blogMetadataForm,
        blogLength: { ...blogMetadataForm.blogLength, min: parseInt(value) },
      });
    } else if (id === 'max-words') {
      setBlogMetadataForm({
        ...blogMetadataForm,
        blogLength: { ...blogMetadataForm.blogLength, max: parseInt(value) },
      });
    } else {
      setBlogMetadataForm({ ...blogMetadataForm, [id]: value });
    }
  };

  const validateForm = () => {
    const { title, description, desiredTone, seoKeywords, targetAudience, blogLength } =
      blogMetadataForm;

    const validations = [
      validateTextField(title, 'Title', { maxLength: 100, required: true }),
      validateTextField(description, 'Description', { maxLength: 500, required: true }),
      validateTextField(desiredTone, 'Tone', { maxLength: 20, required: true }),
      validateTextField(seoKeywords, 'SEO keywords', { maxLength: 200, required: true }),
      validateTextField(targetAudience, 'Target audience', { maxLength: 100, required: true }),
      validateMinMaxRelation(blogLength.min, blogLength.max, 'Blog Length'),
    ];

    for (const validation of validations) {
      if (!validation.validated) return validation;
    }

    return { validated: true };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (blogMetadataForm.desiredTone === 'custom') {
      setBlogMetadataForm({ ...blogMetadataForm, desiredTone: customDesiredTone });
    }
    if (blogMetadataForm.targetAudience === 'custom') {
      setBlogMetadataForm({ ...blogMetadataForm, targetAudience: customTargetAudience });
    }

    const formValidation = validateForm();

    if (!formValidation.validated) {
      showErrorToast(null, formValidation.msg);
      return;
    }

    try {
      updateBlogLoading(true);
      
      // Prepare blog data
      const blogData = {
        title: blogMetadataForm.title,
        description: blogMetadataForm.description,
        desired_tone: blogMetadataForm.desiredTone,
        seo_keywords: blogMetadataForm.seoKeywords.split(',').map(k => k.trim()).filter(k => k),
        target_audience: blogMetadataForm.targetAudience,
        blog_length_min: blogMetadataForm.blogLength.min,
        blog_length_max: blogMetadataForm.blogLength.max,
      };
      
      // Create blog via API
      const createdBlog = await createBlog(apiClient, blogData);
      
      // Update UI state
      addBlog({ id: createdBlog.id, title: createdBlog.title });
      updateMarkdown(createdBlog.content);
      setActiveBlogId(createdBlog.id.toString());
      
    } catch (error) {
      console.error('Failed to create blog:', error);
      showErrorToast(null, 'Failed to create blog. Please try again.');
    } finally {
      updateBlogLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-start ">
      <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
        <Accordion
          trigger={
            <AccordianTitle
              title="Title"
              tooltipText="Not a final title - used for AI context only"
            />
          }
          defaultOpen={true}
        >
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
            <TextField className="h-auto w-full flex-none" variant="filled" label="" helpText="">
              <TextField.Input
                id="title"
                required
                placeholder="Blog Title"
                value={blogMetadataForm.title}
                onChange={handleInputChange}
                disabled={blogLoading}
              />
            </TextField>
          </div>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
        <Accordion
          trigger={
            <AccordianTitle
              title="Description"
              tooltipText="Permanent context for AI - make it clear and complete."
            />
          }
          defaultOpen={true}
        >
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
            <TextArea className="h-auto w-full flex-none" variant="filled" label="" helpText="">
              <TextArea.Input
                id="description"
                required
                placeholder="Description of the Blog..."
                value={blogMetadataForm.description}
                onChange={handleInputChange}
                disabled={blogLoading}
              />
            </TextArea>
          </div>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
        <Accordion
          trigger={<AccordianTitle title="Target Audience" tooltipText="Target Audience." />}
          defaultOpen={true}
        >
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
            <RadioGroup
              className="h-auto w-full flex-none"
              required
              value={blogMetadataForm.targetAudience}
              onValueChange={(value: string) => {
                setBlogMetadataForm({ ...blogMetadataForm, targetAudience: value });
              }}
              disabled={blogLoading}
            >
              <RadioGroup.Option label="General Audience" value="general audience" />
              <RadioGroup.Option label="Beginners" value="beginners" />
              <RadioGroup.Option label="Intermediate" value="intermediate" />
              <RadioGroup.Option label="Advanced / Experts" value="advance and experts" />
              <div className="flex items-center gap-2">
                <RadioGroup.Option label="Custom" value="custom" />
                <TextField.Input
                  id="customDesiredTone"
                  required
                  disabled={blogMetadataForm.targetAudience !== 'custom' || blogLoading}
                  placeholder=""
                  value={customTargetAudience}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomTargetAudience(event.target.value);
                  }}
                  className="h-6 border border-solid border-neutral-border rounded-md p-2 w-32"
                />
              </div>
            </RadioGroup>
          </div>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
        <Accordion
          trigger={<AccordianTitle title="Desired Tone" tooltipText="Desired tone of the blog." />}
          defaultOpen={true}
        >
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
            <RadioGroup
              className="h-auto w-full flex-none"
              required
              value={blogMetadataForm.desiredTone}
              onValueChange={(value: string) => {
                setBlogMetadataForm({ ...blogMetadataForm, desiredTone: value });
              }}
              disabled={blogLoading}
            >
              <RadioGroup.Option label="Formal" value="formal" />
              <RadioGroup.Option label="Casual" value="casual" />
              <RadioGroup.Option label="Educational" value="eduactional" />
              <div className="flex items-center gap-2">
                <RadioGroup.Option label="Custom" value="custom" />
                <TextField.Input
                  id="customDesiredTone"
                  required
                  disabled={blogMetadataForm.desiredTone !== 'custom' || blogLoading}
                  placeholder=""
                  value={customDesiredTone}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCustomDesiredTone(event.target.value);
                  }}
                  className="h-6 border border-solid border-neutral-border rounded-md p-2 w-32"
                />
              </div>
            </RadioGroup>
          </div>
        </Accordion>
      </div>
      <div className="flex w-full flex-col items-start border-b border-solid border-neutral-border bg-default-background">
        <Accordion
          trigger={
            <AccordianTitle title="Blog Length" tooltipText="Length of the blog in words." />
          }
          defaultOpen={true}
        >
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-body font-body text-default-font" htmlFor="min-words">
                  Min Words
                </label>
                <label className="text-body font-body text-default-font" htmlFor="max-words">
                  Max Words
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <TextField.Input
                  id="min-words"
                  required
                  min={100}
                  value={`${blogMetadataForm.blogLength.min}`}
                  type="number"
                  onChange={handleInputChange}
                  disabled={blogLoading}
                  className="h-6 border border-solid border-neutral-border rounded-md p-2 w-20"
                />
                <TextField.Input
                  id="max-words"
                  required
                  min={200}
                  value={`${blogMetadataForm.blogLength.max}`}
                  type="number"
                  onChange={handleInputChange}
                  disabled={blogLoading}
                  className="h-6 border border-solid border-neutral-border rounded-md p-2 w-20"
                />
              </div>
            </div>
          </div>
        </Accordion>
      </div>
      <Accordion
        trigger={
          <AccordianTitle title="SEO Keywords" tooltipText="Comma separated list of keywords." />
        }
        defaultOpen={true}
      >
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-2 px-4 pb-4">
          <TextArea className="h-auto w-full flex-none" variant="filled" label="" helpText="">
            <TextArea.Input
              id="seoKeywords"
              required
              placeholder="Target Audience ..."
              value={blogMetadataForm.seoKeywords}
              onChange={handleInputChange}
              disabled={blogLoading}
            />
          </TextArea>
        </div>
      </Accordion>
      <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-neutral-border" />
      <div className="px-3 py-3 w-full">
        <Button className="h-8 w-full flex-none" type="submit" disabled={blogLoading}>
          Create!
        </Button>
      </div>
    </form>
  );
};

export default BlogIntentForm;
