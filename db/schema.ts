import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tags = sqliteTable("tags", { id: text("id").primaryKey(), name: text("name").notNull().unique() });

export const recipes = sqliteTable("recipes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  categoryId: text("category_id").references(() => categories.id),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull().default("easy"),
  prepTimeMinutes: integer("prep_time_minutes"),
  cookTimeMinutes: integer("cook_time_minutes"),
  servings: integer("servings"),
  tips: text("tips"),
  chef: text("chef"),
  createdById: text("created_by_id").notNull().references(() => users.id),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const recipeTags = sqliteTable("recipe_tags", {
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({ uniqueRecipeTag: uniqueIndex("recipe_tags_unique").on(table.recipeId, table.tagId) }));

export const ingredients = sqliteTable("ingredients", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: text("amount"),
  group: text("group", { enum: ["main", "seasoning"] }).notNull().default("main"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const recipeSteps = sqliteTable("recipe_steps", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
});

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
}, (table) => ({ uniqueFavorite: uniqueIndex("favorites_unique").on(table.userId, table.recipeId) }));

export const cookingLogs = sqliteTable("cooking_logs", {
  id: text("id").primaryKey(),
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  cookedAt: integer("cooked_at").notNull().default(sql`(unixepoch() * 1000)`),
  note: text("note"),
});

export const weeklyMenus = sqliteTable("weekly_menus", {
  id: text("id").primaryKey(),
  weekStartDate: integer("week_start_date").notNull(),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const weeklyMenuItems = sqliteTable("weekly_menu_items", {
  id: text("id").primaryKey(),
  weeklyMenuId: text("weekly_menu_id").notNull().references(() => weeklyMenus.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id").references(() => recipes.id, { onDelete: "set null" }),
  customText: text("custom_text"),
  date: integer("date").notNull(),
  mealType: text("meal_type", { enum: ["breakfast", "lunch", "dinner"] }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const shoppingLists = sqliteTable("shopping_lists", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source", { enum: ["manual", "weekly_menu"] }).notNull().default("manual"),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const shoppingListItems = sqliteTable("shopping_list_items", {
  id: text("id").primaryKey(),
  shoppingListId: text("shopping_list_id").notNull().references(() => shoppingLists.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: text("amount"),
  category: text("category"),
  checked: integer("checked", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const mealOrders = sqliteTable("meal_orders", {
  id: text("id").primaryKey(),
  totalCount: integer("total_count").notNull().default(0),
  createdById: text("created_by_id").notNull().references(() => users.id),
  createdAt: integer("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const mealOrderItems = sqliteTable("meal_order_items", {
  id: text("id").primaryKey(),
  mealOrderId: text("meal_order_id").notNull().references(() => mealOrders.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id").notNull().references(() => recipes.id, { onDelete: "cascade" }),
  recipeTitle: text("recipe_title").notNull(),
  coverImageUrl: text("cover_image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const usersRelations = relations(users, ({ many }) => ({ recipes: many(recipes) }));
