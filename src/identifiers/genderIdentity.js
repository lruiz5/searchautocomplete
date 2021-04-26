const items = [
  // this is the parent or 'item'
  {
    name: "Gender Identity",
    id: 1,
    // these are the children or 'sub items'
    children: [
      {
        id: "male-identified",
        name: "Male Identified",
      },
      {
        id: "female-identified",
        name: "Female Identified",
      },
      {
        id: "transwoman",
        name: "Transwoman Identified",
      },
      {
        id: "transman",
        name: "Transman Identified",
      },
      {
        id: "genderfluid",
        name: "Genderfluid",
      },
      {
        id: "non-binary",
        name: "Non-binary",
      },
      {
        id: "decline-to-state",
        name: "Decline to state",
      },
    ],
  },
];

module.exports = items;
