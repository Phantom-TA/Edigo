import { eq } from "drizzle-orm";
import { db } from "../_configs/db";
import { CourseList } from "../_configs/Schema";

export const getUserCourse = async ({
    username
}: {
    username: string
}) => {
    try {
        const result = await db.select().from(CourseList).where(eq(CourseList.username, username));
        return result;
    } catch (error) {
        console.error("Error fetching user courses:", error);
        return [];
    }
}