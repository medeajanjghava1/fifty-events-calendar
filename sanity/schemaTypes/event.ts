import { defineField, defineType } from "sanity";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Start date & time",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End date & time",
      description: "Optional — leave empty for a single-moment event.",
      type: "datetime",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      initialValue: "FIFTY, Tbilisi",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "color",
      title: "Calendar color",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Blue", value: "blue" },
          { title: "Orange", value: "orange" },
          { title: "Green", value: "green" },
          { title: "Red", value: "red" },
        ],
      },
      initialValue: "blue",
    }),
    defineField({
      name: "recurrence",
      title: "Repeats",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "enabled",
          title: "This event repeats",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "weekdays",
          title: "On these weekdays",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Monday", value: "mon" },
              { title: "Tuesday", value: "tue" },
              { title: "Wednesday", value: "wed" },
              { title: "Thursday", value: "thu" },
              { title: "Friday", value: "fri" },
              { title: "Saturday", value: "sat" },
              { title: "Sunday", value: "sun" },
            ],
          },
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "intervalWeeks",
          title: "Every N weeks",
          type: "number",
          initialValue: 2,
          description: "1 = every week, 2 = every other week, and so on.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "until",
          title: "Repeat until",
          type: "date",
          description: "Optional — leave empty for an open-ended series.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
        defineField({
          name: "exceptions",
          title: "Skip these dates",
          type: "array",
          of: [{ type: "date" }],
          description:
            "Dates that would otherwise be in the series but shouldn't show — e.g. another event already has that night.",
          hidden: ({ parent }) => !parent?.enabled,
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", date: "date", media: "cover" },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Tbilisi",
        }) : undefined,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Date, soonest first",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
});
