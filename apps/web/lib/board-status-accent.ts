import type { TaskStatus } from '@teamwork/types';

interface BoardStatusAccent {
  cardClassName: string;
  dotClassName: string;
}

const BOARD_STATUS_ACCENTS: Record<TaskStatus, BoardStatusAccent> = {
  todo: {
    cardClassName: 'border-[#c8f3d6] bg-[#f3fdf6]',
    dotClassName: 'bg-[#7be7a5]',
  },
  in_progress: {
    cardClassName: 'border-[#ffe067] bg-[#fffceb]',
    dotClassName: 'bg-[#ffbc00]',
  },
  done: {
    cardClassName: 'border-[#dccfff] bg-[#f7f3ff]',
    dotClassName: 'bg-[#7a2cf5]',
  },
};

export function readBoardStatusAccent(status: TaskStatus): BoardStatusAccent {
  return BOARD_STATUS_ACCENTS[status];
}
