const MainModel = require(__path_schemas + "careers");

// TODO: biến đổi: careers[in]=5d7a514b5d2c12c7449be025 => { careers: { $in: [5d7a514b5d2c12c7449be025] } }
const parseBracketQuery = (query) => {
  return Object.entries(query).reduce((acc, [key, value]) => {
    if (key === "select") return acc;

    const match = key.match(/^(.+)\[(.+)\]$/);

    if (match) {
      const field = match[1]; // careers
      const operator = `$${match[2]}`; // $in

      if (!acc[field]) acc[field] = {};

      // các operator MongoDB yêu cầu giá trị là array
      const ARRAY_OPERATORS = new Set([
        "$in",
        "$nin",
        "$all",
        "$and",
        "$or",
        "$nor",
      ]);
      acc[field][operator] =
        ARRAY_OPERATORS.has(operator) && !Array.isArray(value)
          ? [value]
          : value;
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
};

module.exports = {
  listCareers: async (params, options) => {
    const queryFind = { ...params };
    let select, sort;

    let removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((field) => delete queryFind[field]);

    const find = parseBracketQuery(queryFind);

    if (params.select) {
      select = params.select.split(",").join(" ");
    }

    if (params.sort) {
      sort = params.sort.split(",").join(" ");
    }

    // pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 6;
    const skip = (page - 1) * limit;

    if (options.task === "all") {
      return await MainModel.find(find)
        .populate({ path: "restaurants", select: "name" })
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }
    if (options.task === "one") {
      return await MainModel.findById(params.id).select({});
    }
  },
  create: async (item) => {
    return await MainModel(item).save();
  },
  editItem: async (params, options) => {
    if (options.task === "edit") {
      return await MainModel.updateOne({ _id: params.id }, params.body);
    }
  },
  even: async (params, options) => {
    const type = params.type;
    if (type !== "like" && type !== "dislike") return;
    return await MainModel.findByIdAndUpdate(
      params.id,
      { $inc: { [type]: 1 } },
      { returnDocument: "after" },
    );
  },
  deleteItem: async (params, options) => {
    if (options.task === "one") {
      return await MainModel.deleteOne({ _id: params.id });
    }
  },
};
