import { useGlobalStore } from '@/lib/store/globalstore';
import type { TranscriptionMeta } from '@/lib/types/transcript.types';
import React, { useMemo, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useShallow } from 'zustand/shallow';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';

interface BreadcrumbProps {
  path: string;
}

export const generateBreadcrumbs = (
  path: string,
  activeTranscription: TranscriptionMeta | null,
) => {
  const segments = path.split('/').filter((segment) => segment);
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    let title = segment;
    if (activeTranscription && segment === activeTranscription.id) {
      title = activeTranscription.name;
    }
    // console.info(' -- - title ---', title);
    if(!title) {
      title = 'Untitled';
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);
    return {
      title,
      link: href,
    };
  });
  return breadcrumbs;
};

export const BreadcrumbComponent: React.FC<BreadcrumbProps> = () => {
  const location = useLocation();
  const { pathname } = location;
  const [setPagetitle, setBreadcrumbItems, activeTranscription] =
    useGlobalStore(
      useShallow((state) => [
        state.setPagetitle,
        state.setBreadcrumbItems,
        state.activeTranscription,
      ]),
    );

  const breadcrumbs = useMemo(
    () => generateBreadcrumbs(pathname, activeTranscription),
    [pathname, activeTranscription],
  );

  useEffect(() => {
    if (breadcrumbs.length > 0) {
      const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
      setPagetitle(lastBreadcrumb.title, '', lastBreadcrumb.link);
    }
    setBreadcrumbItems(breadcrumbs);
  }, [breadcrumbs, setPagetitle, setBreadcrumbItems]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.title}>
            <BreadcrumbItem>
              <BreadcrumbLink href={breadcrumb.link}>
                {breadcrumb.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbComponent;
