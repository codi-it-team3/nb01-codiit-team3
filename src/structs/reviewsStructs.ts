import { integer, min, nonempty, object, partial, string } from 'superstruct';

export const UpdateReviewBodyStruct = partial(
  object({
    rating: min(integer(), 0),
    content: nonempty(string()),
  }),
);
