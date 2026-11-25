
import {
    useEffect,
    useState
}
    from "react";

import {
    useCourses
}
    from "../../hooks/useCourses";

import DataList
    from "../../components/headless/DataList";

import CardList from "../../components/headless/CardList";
import DataGrid from "../../components/headless/DataGrid";
import CourseCard from "./CourseCard";
import CourseModal from "../../components/modals/CourseModal";
import CourseViewModal from "../../components/modals/CourseViewModal";
import { toast } from "react-toastify";

function CoursesPage() {

    const {
        courses,
        fetchCourses,
        createCourse,
        editCourse,
        deleteCourse,
    } = useCourses();
    const [showModal, setShowModal] =
        useState(false);

    const [showView, setShowView] =
        useState(false);

    const [selectedCourse,
        setSelectedCourse] =
        useState(null);


    const [search,
        setSearch]
        =
        useState("");

    const [sortBy,
        setSortBy]
        =
        useState("name");
    const [viewType, setViewType] =
        useState("list");

    useEffect(() => {
        fetchCourses();
    }, []);

    const filteredCourses
        =
        [...courses]

            .filter((course) =>

                course.name
                    .toLowerCase()
                    .includes(
                        search.toLowerCase()
                    )

            )
            .sort((a, b) => {
                switch (sortBy) {
                    case "fee":
                        return a.fee - b.fee;

                    case "students":
                        return (
                            Number(a.enrolledStudents) -
                            Number(b.enrolledStudents)
                        );

                    case "duration":
                        return (
                            parseInt(a.duration || 0) -
                            parseInt(b.duration || 0)
                        );

                    default:
                        return a.name.localeCompare(
                            b.name
                        );
                }
            });
    const handleView = (course) => {
        setSelectedCourse(course);
        setShowView(true);
        toast.info(
            `${course.name} details opened 📚`
        );
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        toast.error("Course removed from the org");
        await deleteCourse(id);

        fetchCourses();
    };
    const handleSave = async (
        courseData
    ) => {
        if (selectedCourse) {
            await editCourse(
                selectedCourse.id,
                {
                    ...courseData,
                    id: selectedCourse.id,
                }
            );
            toast.info(
                "Details Edited Successfully"
            );
        } else {
            await createCourse(
                courseData
            );
            toast.success(
                "Course added to the org"
            );
        }

        await fetchCourses();

        setShowModal(false);

        setSelectedCourse(null);
    };
    const courseColumns = [
        {
            key: "name",
            label: "Course",
        },
        {
            key: "trainer",
            label: "Trainer",
        },
        {
            key: "duration",
            label: "Duration",
        },
        {
            key: "fee",
            label: "Fee",
        },
        {
            key: "enrolledStudents",
            label: "Students",
        },
    ];
    return (

        <div>

            <div
                className="
 d-flex
 justify-content-between
 mb-4"
            >

                <input

                    className=
                    "form-control"

                    style={{
                        width: "250px"
                    }}

                    placeholder=
                    "Search Course"

                    value={search}

                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setSelectedCourse(null);
                        setShowModal(true);
                    }}
                >
                    Add Course
                </button>
                <select
                    className="form-select w-auto"
                    value={viewType}
                    onChange={(e) =>
                        setViewType(e.target.value)
                    }
                >
                    <option value="card">
                        Card View
                    </option>

                    <option value="table">
                        Table View
                    </option>

                    <option value="list">
                        List View
                    </option>
                </select>
                <select
                    className="form-select"
                    style={{ width: "220px" }}
                    value={sortBy}
                    onChange={(e) =>
                        setSortBy(e.target.value)
                    }
                >
                    <option value="name">
                        Course Name
                    </option>

                    <option value="fee">
                        Fee
                    </option>

                    <option value="students">
                        Students
                    </option>

                    <option value="duration">
                        Duration (Months)
                    </option>
                </select>

            </div>

            {filteredCourses.length > 0 ? (
                <>
                    {viewType === "card" && (
                        <CardList
                            data={filteredCourses}
                            renderItem={(course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            )}
                        />
                    )}

                    {viewType === "table" && (
                        <DataGrid
                            columns={courseColumns}
                            data={filteredCourses}
                            renderActions={(row) => (
                                <>
                                    <button
                                        className="btn btn-sm btn-primary me-2"
                                        onClick={() =>
                                            handleView(row)
                                        }
                                    >
                                        View
                                    </button>

                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() =>
                                            handleEdit(row)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() =>
                                            handleDelete(
                                                row.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        />
                    )}

                    {viewType === "list" && (
                        <DataList
                            data={filteredCourses}
                            renderItem={(course) => (
                                <div
                                    key={course.id}
                                    className="course-item"
                                >
                                    <div>
                                        <h5>
                                            {course.name}
                                        </h5>

                                        <p>
                                            Trainer:
                                            {course.trainer}
                                        </p>

                                        <p>
                                            Duration:
                                            {
                                                course.duration
                                            }
                                        </p>

                                        <p>
                                            Fee: ₹
                                            {course.fee}
                                        </p>

                                        <p>
                                            Students:
                                            {
                                                course.enrolledStudents
                                            }
                                        </p>
                                    </div>

                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() =>
                                                handleView(
                                                    course
                                                )
                                            }
                                        >
                                            View
                                        </button>

                                        <button
                                            className="btn btn-warning btn-sm"
                                            onClick={() =>
                                                handleEdit(
                                                    course
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                handleDelete(
                                                    course.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        />
                    )}
                </>
            ) : (
                <div className="text-center mt-5">
                    No Courses Found
                </div>
            )}
            <CourseModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setSelectedCourse(null);
                }}
                onSave={handleSave}
                course={selectedCourse}
            />

            <CourseViewModal
                show={showView}
                onHide={() =>
                    setShowView(false)
                }
                course={selectedCourse}
            />

        </div>

    );

}

export default CoursesPage;