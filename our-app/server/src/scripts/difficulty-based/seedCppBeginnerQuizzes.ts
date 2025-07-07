import mongoose from "mongoose";
import Course from "../../models/Course";
import Quiz from "../../models/Quiz";

// Import all beginner quiz data
import arraysQuiz from "../../data/cpp/beginner/Arrays";
import linkedListsQuiz from "../../data/cpp/beginner/LinkedLists";
import matricesQuiz from "../../data/cpp/beginner/Matrices";
import queuesQuiz from "../../data/cpp/beginner/Queues";
import recursionQuiz from "../../data/cpp/beginner/Recursion";
import stacksQuiz from "../../data/cpp/beginner/Stacks";
import stringsQuiz from "../../data/cpp/beginner/Strings";
import complexityAnalysisQuiz from "../../data/cpp/beginner/ComplexityAnalysis";
import pointersQuiz from "../../data/cpp/beginner/Pointers";
import hashTablesQuiz from "../../data/cpp/beginner/HashTables";
import treesQuiz from "../../data/cpp/beginner/Trees";
import binaryTreesQuiz from "../../data/cpp/beginner/BinaryTrees";
import binarySearchTreesQuiz from "../../data/cpp/beginner/BinarySearchTrees";
import heapsQuiz from "../../data/cpp/beginner/Heaps";
import graphsQuiz from "../../data/cpp/beginner/Graphs";
import sortingAlgorithmsQuiz from "../../data/cpp/beginner/SortingAlgorithms";
import searchingAlgorithmsQuiz from "../../data/cpp/beginner/SearchingAlgorithms";
import bfsQuiz from "../../data/cpp/beginner/BFS";
import dfsQuiz from "../../data/cpp/beginner/DFS";
import divideAndConquerQuiz from "../../data/cpp/beginner/DivideAndConquer";
import greedyAlgorithmsQuiz from "../../data/cpp/beginner/GreedyAlgorithms";
import binarySearchQuiz from "../../data/cpp/beginner/BinarySearch";
import twoPointersQuiz from "../../data/cpp/beginner/TwoPointers";
import slidingWindowQuiz from "../../data/cpp/beginner/SlidingWindow";
import binaryOperationsQuiz from "../../data/cpp/beginner/BinaryOperations";
import backtrackingQuiz from "../../data/cpp/beginner/Backtracking";
import dynamicProgrammingQuiz from "../../data/cpp/beginner/DynamicProgramming";
import dijkstrasAlgorithmQuiz from "../../data/cpp/beginner/DijkstrasAlgorithm";
import bellmanFordAlgorithmQuiz from "../../data/cpp/beginner/BellmanFordAlgorithm";
import floydWarshallAlgorithmQuiz from "../../data/cpp/beginner/FloydWarshallAlgorithm";
import primsAlgorithmQuiz from "../../data/cpp/beginner/PrimsAlgorithm";
import kruskalsAlgorithmQuiz from "../../data/cpp/beginner/KruskalsAlgorithm";
import topologicalSortQuiz from "../../data/cpp/beginner/TopologicalSort";
import avlTreesQuiz from "../../data/cpp/beginner/AVLTrees";
import redBlackTreesQuiz from "../../data/cpp/beginner/RedBlackTrees";
import bTreesQuiz from "../../data/cpp/beginner/BTrees";
import triesQuiz from "../../data/cpp/beginner/Tries";
import segmentTreesQuiz from "../../data/cpp/beginner/SegmentTrees";
import fenwickTreesQuiz from "../../data/cpp/beginner/FenwickTrees";
import disjointSetUnionQuiz from "../../data/cpp/beginner/DisjointSetUnion";
import suffixArraysTreesQuiz from "../../data/cpp/beginner/SuffixArraysTrees";

const seedCppBeginnerQuizzes = async () => {
    try {
        // Get all required courses
        const courses = await Course.find({
            courseName: {
                $in: [
                    'Arrays', 'LinkedLists', 'Matrices', 'Queues', 'Recursion', 'Stacks', 'Strings',
                    'ComplexityAnalysis', 'Pointers', 'HashTables', 'Trees', 'BinaryTrees',
                    'BinarySearchTrees', 'Heaps', 'Graphs', 'SortingAlgorithms', 'SearchingAlgorithms',
                    'BFS', 'DFS', 'DivideAndConquer', 'GreedyAlgorithms', 'BinarySearch',
                    'TwoPointers', 'SlidingWindow', 'BinaryOperations', 'Backtracking',
                    'DynamicProgramming', 'DijkstrasAlgorithm', 'BellmanFordAlgorithm',
                    'FloydWarshallAlgorithm', 'PrimsAlgorithm', 'KruskalsAlgorithm',
                    'TopologicalSort', 'AVLTrees', 'RedBlackTrees', 'BTrees', 'Tries',
                    'SegmentTrees', 'FenwickTrees', 'DisjointSetUnion', 'SuffixArraysTrees'
                ]
            }
        });

        const courseMap = courses.reduce((map, course) => {
            map[course.courseName] = course;
            return map;
        }, {} as { [key: string]: any });

        // Map of quiz data to their corresponding course titles
        const quizzesByCourse = {
            'Arrays': arraysQuiz,
            'LinkedLists': linkedListsQuiz,
            'Matrices': matricesQuiz,
            'Queues': queuesQuiz,
            'Recursion': recursionQuiz,
            'Stacks': stacksQuiz,
            'Strings': stringsQuiz,
            'ComplexityAnalysis': complexityAnalysisQuiz,
            'Pointers': pointersQuiz,
            'HashTables': hashTablesQuiz,
            'Trees': treesQuiz,
            'BinaryTrees': binaryTreesQuiz,
            'BinarySearchTrees': binarySearchTreesQuiz,
            'Heaps': heapsQuiz,
            'Graphs': graphsQuiz,
            'SortingAlgorithms': sortingAlgorithmsQuiz,
            'SearchingAlgorithms': searchingAlgorithmsQuiz,
            'BFS': bfsQuiz,
            'DFS': dfsQuiz,
            'DivideAndConquer': divideAndConquerQuiz,
            'GreedyAlgorithms': greedyAlgorithmsQuiz,
            'BinarySearch': binarySearchQuiz,
            'TwoPointers': twoPointersQuiz,
            'SlidingWindow': slidingWindowQuiz,
            'BinaryOperations': binaryOperationsQuiz,
            'Backtracking': backtrackingQuiz,
            'DynamicProgramming': dynamicProgrammingQuiz,
            'DijkstrasAlgorithm': dijkstrasAlgorithmQuiz,
            'BellmanFordAlgorithm': bellmanFordAlgorithmQuiz,
            'FloydWarshallAlgorithm': floydWarshallAlgorithmQuiz,
            'PrimsAlgorithm': primsAlgorithmQuiz,
            'KruskalsAlgorithm': kruskalsAlgorithmQuiz,
            'TopologicalSort': topologicalSortQuiz,
            'AVLTrees': avlTreesQuiz,
            'RedBlackTrees': redBlackTreesQuiz,
            'BTrees': bTreesQuiz,
            'Tries': triesQuiz,
            'SegmentTrees': segmentTreesQuiz,
            'FenwickTrees': fenwickTreesQuiz,
            'DisjointSetUnion': disjointSetUnionQuiz,
            'SuffixArraysTrees': suffixArraysTreesQuiz
        };

        // Seed all beginner quizzes
        for (const [courseTitle, quizData] of Object.entries(quizzesByCourse)) {
            const course = courseMap[courseTitle];
            if (!course) {
                console.error(`Could not find the '${courseTitle}' course. Skipping quiz insertion.`);
                continue;
            }

            // Create a new quiz object to avoid modifying the original data
            const newQuiz = {
                title: quizData.title,
                quizLevel: quizData.quizLevel,
                lang: quizData.lang,
                description: quizData.description,
                topic: {
                    courseID: course._id,
                    courseName: course.courseName
                },
                questions: quizData.questions,
                quizScore: quizData.quizScore
            };

            await Quiz.insertMany([newQuiz]);
            console.log(`Inserted C++ beginner quiz for: ${courseTitle}`);
        }

        console.log("C++ beginner quizzes inserted successfully.");
    } catch (error) {
        console.error("Error seeding C++ beginner quizzes:", error);
        throw error;
    }
};

export default seedCppBeginnerQuizzes; 